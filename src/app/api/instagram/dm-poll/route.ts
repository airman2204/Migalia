import { NextRequest, NextResponse } from 'next/server';
import { IgApiClient } from 'instagram-private-api';
import { supabase } from '@/lib/supabase';
import { CustomerConversation, CustomerMessage } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const IG_USERNAME = process.env.IG_USERNAME || 'migaliabky';
const IG_PASSWORD = process.env.IG_PASSWORD || '';
const SESSION_KEY = 'ig-session-store';

async function buildClient(): Promise<IgApiClient> {
  const ig = new IgApiClient();
  ig.state.generateDevice(IG_USERNAME);

  // Intentar restaurar sesión guardada en Supabase
  const { data: sessionRow } = await supabase
    .from('tasks')
    .select('description')
    .eq('id', SESSION_KEY)
    .maybeSingle();

  if (sessionRow?.description) {
    try {
      await ig.state.deserialize(JSON.parse(sessionRow.description));
      // Verificar que la sesión siga válida
      await ig.account.currentUser();
      console.log('[IG DM Poll] Sesión restaurada OK');
      return ig;
    } catch (e) {
      console.log('[IG DM Poll] Sesión expirada, re-iniciando sesión');
    }
  }

  // Login fresco
  await ig.simulate.preLoginFlow();
  const loggedUser = await ig.account.login(IG_USERNAME, IG_PASSWORD);
  await ig.simulate.postLoginFlow();
  console.log('[IG DM Poll] Login exitoso:', loggedUser.username);

  // Guardar sesión
  const sessionData = await ig.state.serialize();
  delete (sessionData as any).constants;

  await supabase.from('tasks').upsert({
    id: SESSION_KEY,
    title: 'Instagram Session Store',
    description: JSON.stringify(sessionData),
    status: 'done',
    priority: 'low',
    assigned_to: 'partner-1',
    category: 'Sistema',
    subtasks: [],
  });

  return ig;
}

export async function GET(request: NextRequest) {
  try {
    if (!IG_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'IG_PASSWORD no configurado en Vercel' },
        { status: 400 }
      );
    }

    const ig = await buildClient();

    // Obtener bandeja de DMs
    const inboxFeed = ig.feed.directInbox();
    const threads = await inboxFeed.items();

    // Traer datos actuales de Supabase
    const { data: currentMeta } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', 'meta-customer-service')
      .maybeSingle();

    const existingConvs: CustomerConversation[] =
      currentMeta && Array.isArray(currentMeta.subtasks) ? currentMeta.subtasks : [];

    const { data: currentMsgsMeta } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', 'meta-customer-messages')
      .maybeSingle();

    let messagesMap: Record<string, CustomerMessage[]> =
      currentMsgsMeta?.subtasks && typeof currentMsgsMeta.subtasks === 'object'
        ? Array.isArray(currentMsgsMeta.subtasks)
          ? (currentMsgsMeta.subtasks[0] as Record<string, CustomerMessage[]>) || {}
          : (currentMsgsMeta.subtasks as Record<string, CustomerMessage[]>)
        : {};

    const updatedConvsList: CustomerConversation[] = [...existingConvs];
    let newCount = 0;

    for (const thread of threads) {
      const convId = thread.thread_id;

      // Participante que no sea la cuenta propia
      const otherUser = thread.users?.[0];
      if (!otherUser) continue;

      const participantName =
        otherUser.full_name || otherUser.username || `Usuario ${String(otherUser.pk).slice(-4)}`;
      const participantHandle = `@${otherUser.username || otherUser.pk}`;

      const lastItem = thread.items?.[0];
      const lastMsgText =
        lastItem?.text ||
        (lastItem?.item_type === 'media' ? '📷 Imagen' : 'Nuevo mensaje');
      const lastMsgTime = lastItem?.timestamp
        ? new Date(Number(lastItem.timestamp) / 1000).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Ahora';

      const existingIndex = updatedConvsList.findIndex(
        (c) => c.id === convId || c.customerHandle === participantHandle
      );

      if (existingIndex >= 0) {
        updatedConvsList[existingIndex] = {
          ...updatedConvsList[existingIndex],
          customerName: participantName,
          customerHandle: participantHandle,
          lastMessage: lastMsgText,
          lastMessageTime: lastMsgTime,
        };
      } else {
        newCount++;
        updatedConvsList.unshift({
          id: convId,
          platform: 'instagram',
          customerHandle: participantHandle,
          customerName: participantName,
          lastMessage: lastMsgText,
          lastMessageTime: lastMsgTime,
          unreadCount: (thread as any).read_state === 0 ? 0 : 1,
          status: 'pending',
          category: 'General',
          createdAt: new Date().toISOString().split('T')[0],
          tags: ['Instagram DM'],
        });
      }

      // Procesar mensajes individuales del hilo
      if (thread.items && Array.isArray(thread.items)) {
        const parsedMsgs: CustomerMessage[] = thread.items
          .map((item: any) => ({
            id: item.item_id || String(item.timestamp),
            conversationId: convId,
            sender: item.user_id === otherUser.pk ? 'customer' : ('agent' as 'customer' | 'agent'),
            senderName:
              item.user_id === otherUser.pk ? participantName : 'Migalia',
            content:
              item.text ||
              (item.item_type === 'media' ? '📷 Imagen' : ''),
            timestamp: item.timestamp
              ? new Date(Number(item.timestamp) / 1000).toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Ahora',
            status: 'sent' as const,
          }))
          .reverse();

        messagesMap = {
          ...messagesMap,
          [convId]: parsedMsgs,
        };
      }
    }

    // Guardar en Supabase
    await supabase.from('tasks').upsert({
      id: 'meta-customer-service',
      title: 'Bandeja de Atención a Clientes (Instagram DMs)',
      description: 'Mensajes directos de @migaliabky sincronizados vía Instagram Private API',
      status: 'done',
      priority: 'medium',
      assigned_to: 'partner-1',
      category: 'Ventas',
      subtasks: updatedConvsList,
    });

    await supabase.from('tasks').upsert({
      id: 'meta-customer-messages',
      title: 'Historial de Mensajes de Clientes (Instagram)',
      description: 'Mensajes individuales indexados por ID de hilo',
      status: 'done',
      priority: 'medium',
      assigned_to: 'partner-1',
      category: 'Ventas',
      subtasks: [messagesMap],
    });

    // Broadcast en tiempo real
    try {
      supabase.channel('migalia_presence').send({
        type: 'broadcast',
        event: 'data_changed',
        payload: { entity: 'customer_service' },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      syncedThreads: threads.length,
      newConversations: newCount,
      conversations: updatedConvsList,
    });
  } catch (error: any) {
    console.error('[IG DM Poll Error]', error?.message);

    // Si la sesión falló, borrarla para forzar re-login en la próxima llamada
    if (
      error?.message?.includes('login') ||
      error?.message?.includes('checkpoint') ||
      error?.message?.includes('401')
    ) {
      await supabase.from('tasks').delete().eq('id', SESSION_KEY);
    }

    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

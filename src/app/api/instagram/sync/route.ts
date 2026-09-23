import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CustomerConversation, CustomerMessage } from '@/types';

export const dynamic = 'force-dynamic';

const DEFAULT_TOKEN =
  'IGAANfgVCgKLdBZAGFlVFIyRllHMmtRUjFvYkZAOVVpKbjhfaEhRcUJQYUtkbmp4WDBYRTl2M1NsOEF2bUo4eGpCZAzlfX3dxcVJDcU5Xa2ZAkZAldHelI0cjB0NThwWmhVRWtqWEFveWlMUXFvZAGVScEx6M2FOeWh6OVBVeXc3QXAzcwZDZD';

/**
 * GET/POST /api/instagram/sync
 * Consulta en caliente las conversaciones reales de @migaliab en Meta Graph API
 * y las sincroniza en Supabase para mostrarlas en la UI.
 */
export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

async function handleSync(request: NextRequest) {
  try {
    const token =
      process.env.INSTAGRAM_USER_ACCESS_TOKEN && !process.env.INSTAGRAM_USER_ACCESS_TOKEN.includes('FlZAVzFY')
        ? process.env.INSTAGRAM_USER_ACCESS_TOKEN
        : DEFAULT_TOKEN;

    // 1. Consultar conversaciones en Instagram Graph API
    const igRes = await fetch(
      `https://graph.instagram.com/v22.0/me/conversations?fields=id,updated_time,participants,messages{id,message,created_time,from}&access_token=${token}`,
      { cache: 'no-store' }
    );

    const igData = await igRes.json();

    if (!igRes.ok || igData.error) {
      console.error('[Instagram Sync] Error desde Graph API:', igData.error);
      return NextResponse.json({
        success: false,
        error: igData.error?.message || 'Error consultando Graph API',
      }, { status: 400 });
    }

    const rawConvs = igData.data || [];

    // 2. Traer conversaciones actuales de Supabase
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
      currentMsgsMeta && currentMsgsMeta.subtasks && typeof currentMsgsMeta.subtasks === 'object'
        ? Array.isArray(currentMsgsMeta.subtasks)
          ? currentMsgsMeta.subtasks[0] || {}
          : currentMsgsMeta.subtasks
        : {};

    const updatedConvsList: CustomerConversation[] = [...existingConvs];

    for (const item of rawConvs) {
      const convId = item.id;
      const participant = item.participants?.data?.[0];
      const participantId = participant?.id || convId;
      const participantUsername = participant?.username ? `@${participant.username}` : `@ig_user_${participantId.slice(-4)}`;
      const participantName = participant?.name || participant?.username || `Cliente (${participantId.slice(-4)})`;

      const lastRawMsg = item.messages?.data?.[0];
      const lastMsgText = lastRawMsg?.message || 'Nuevo mensaje';
      const lastMsgTime = lastRawMsg?.created_time
        ? new Date(lastRawMsg.created_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        : 'Ahora';

      const existingIndex = updatedConvsList.findIndex((c) => c.id === convId || c.customerHandle === participantUsername);

      if (existingIndex >= 0) {
        updatedConvsList[existingIndex] = {
          ...updatedConvsList[existingIndex],
          customerName: participantName,
          customerHandle: participantUsername,
          lastMessage: lastMsgText,
          lastMessageTime: lastMsgTime,
        };
      } else {
        updatedConvsList.unshift({
          id: convId,
          platform: 'instagram',
          customerHandle: participantUsername,
          customerName: participantName,
          lastMessage: lastMsgText,
          lastMessageTime: lastMsgTime,
          unreadCount: 1,
          status: 'pending',
          category: 'General',
          createdAt: new Date().toISOString().split('T')[0],
          tags: ['Instagram Oficial'],
        });
      }

      // Procesar mensajes individuales de esta conversación
      if (item.messages?.data && Array.isArray(item.messages.data)) {
        const parsedMsgs: CustomerMessage[] = item.messages.data.map((m: any) => ({
          id: m.id,
          conversationId: convId,
          sender: m.from?.username === 'migaliab' ? 'agent' : 'customer',
          senderName: m.from?.username === 'migaliab' ? 'Migalia' : participantName,
          content: m.message || '',
          timestamp: m.created_time
            ? new Date(m.created_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            : 'Ahora',
          status: 'sent',
        })).reverse();

        messagesMap = {
          ...messagesMap,
          [convId]: parsedMsgs,
        };
      }
    }

    // 3. Persistir en Supabase
    await supabase.from('tasks').upsert({
      id: 'meta-customer-service',
      title: 'Bandeja de Atención a Clientes (Instagram DMs & CRM)',
      description: 'Conversaciones y prospectos de redes sociales',
      status: 'done',
      priority: 'medium',
      assigned_to: 'partner-1',
      category: 'Ventas',
      subtasks: updatedConvsList,
    });

    await supabase.from('tasks').upsert({
      id: 'meta-customer-messages',
      title: 'Historial de Mensajes de Clientes (Instagram & CRM)',
      description: 'Mensajes individuales indexados por ID de conversación',
      status: 'done',
      priority: 'medium',
      assigned_to: 'partner-1',
      category: 'Ventas',
      subtasks: [messagesMap],
    });

    try {
      supabase.channel('migalia_presence').send({
        type: 'broadcast',
        event: 'data_changed',
        payload: { entity: 'customer_service' },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      syncedCount: rawConvs.length,
      conversations: updatedConvsList,
    });
  } catch (error: any) {
    console.error('[Instagram Sync API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CustomerConversation, CustomerMessage } from '@/types';

export const dynamic = 'force-dynamic';

// Token de verificación que configuras en el panel de Meta for Developers
const VERIFY_TOKEN = 'migalia_instagram_secret_token_2026';

/**
 * GET: Verificación del Webhook por parte de los servidores de Meta
 * Meta enviará: hub.mode, hub.verify_token y hub.challenge
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Instagram Webhook] Verificado exitosamente con Meta');
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * POST: Recepción de eventos y mensajes en tiempo real de Instagram Direct
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === 'instagram' || body.object === 'page') {
      const entries = body.entry || [];

      for (const entry of entries) {
        // Meta puede enviar los DMs en messaging, standby (si está en otra bandeja o app móvil), o changes
        const rawEvents = [
          ...(entry.messaging || []),
          ...(entry.standby || []),
        ];

        // Si viene en format changes (Instagram Graph API v20+)
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === 'messages' && change.value) {
              rawEvents.push(change.value);
            }
          }
        }

        for (const event of rawEvents) {
          const senderId = event.sender?.id || event.from?.id;
          const recipientId = event.recipient?.id;
          const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();
          const messageText = event.message?.text || event.text;

          // Ignorar mensajes de eco (los enviados por la propia página de Migalia)
          if (event.message?.is_echo || event.is_echo) {
            continue;
          }

          if (senderId && messageText) {
            console.log(`[Instagram DM Recibido] De: ${senderId} - Mensaje: ${messageText}`);

            // Cargar conversaciones existentes de Supabase
            const { data: currentMeta } = await supabase
              .from('tasks')
              .select('*')
              .eq('id', 'meta-customer-service')
              .maybeSingle();

            const existingConversations: CustomerConversation[] =
              currentMeta && Array.isArray(currentMeta.subtasks) ? currentMeta.subtasks : [];

            // Buscar si ya existe conversación con este usuario de Instagram
            const convIndex = existingConversations.findIndex(
              (c) => c.customerHandle === `@${senderId}` || c.id === `conv-ig-${senderId}`
            );

            const timeStr = timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

            let updatedConversations: CustomerConversation[];

            if (convIndex >= 0) {
              const updatedConv: CustomerConversation = {
                ...existingConversations[convIndex],
                lastMessage: messageText,
                lastMessageTime: 'Ahora',
                unreadCount: (existingConversations[convIndex].unreadCount || 0) + 1,
                status: 'pending',
              };
              updatedConversations = [
                updatedConv,
                ...existingConversations.filter((_, idx) => idx !== convIndex),
              ];
            } else {
              const newConv: CustomerConversation = {
                id: `conv-ig-${senderId}`,
                platform: 'instagram',
                customerHandle: `@ig_user_${senderId.slice(-4)}`,
                customerName: `Usuario Instagram (${senderId.slice(-4)})`,
                lastMessage: messageText,
                lastMessageTime: 'Ahora',
                unreadCount: 1,
                status: 'pending',
                category: 'General',
                createdAt: new Date().toISOString().split('T')[0],
                tags: ['Nuevo DM', 'Instagram Oficial'],
              };
              updatedConversations = [newConv, ...existingConversations];
            }

            // Actualizar mensajes
            const { data: currentMsgsMeta } = await supabase
              .from('tasks')
              .select('*')
              .eq('id', 'meta-customer-messages')
              .maybeSingle();

            const existingMessagesMap: Record<string, CustomerMessage[]> =
              currentMsgsMeta && currentMsgsMeta.subtasks && typeof currentMsgsMeta.subtasks === 'object'
                ? Array.isArray(currentMsgsMeta.subtasks)
                  ? currentMsgsMeta.subtasks[0] || {}
                  : currentMsgsMeta.subtasks
                : {};

            const convId = convIndex >= 0 ? existingConversations[convIndex].id : `conv-ig-${senderId}`;
            const existingList = existingMessagesMap[convId] || [];

            const newMsg: CustomerMessage = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              conversationId: convId,
              sender: 'customer',
              senderName: `Usuario (@${senderId.slice(-4)})`,
              content: messageText,
              timestamp: timeStr,
              status: 'sent',
            };

            const updatedMessagesMap = {
              ...existingMessagesMap,
              [convId]: [...existingList, newMsg],
            };

            // Guardar en Supabase y emitir presencia en tiempo real
            await supabase.from('tasks').upsert({
              id: 'meta-customer-service',
              title: 'Bandeja de Atención a Clientes (Instagram DMs & CRM)',
              description: 'Conversaciones y prospectos de redes sociales',
              status: 'done',
              priority: 'medium',
              assigned_to: 'partner-1',
              category: 'Ventas',
              subtasks: updatedConversations,
            });

            await supabase.from('tasks').upsert({
              id: 'meta-customer-messages',
              title: 'Historial de Mensajes de Clientes (Instagram & CRM)',
              description: 'Mensajes individuales indexados por ID de conversación',
              status: 'done',
              priority: 'medium',
              assigned_to: 'partner-1',
              category: 'Ventas',
              subtasks: [updatedMessagesMap],
            });

            supabase.channel('migalia_presence').send({
              type: 'broadcast',
              event: 'data_changed',
              payload: { entity: 'customer_service' },
            });
          }
        }
      }

      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    console.error('[Instagram Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

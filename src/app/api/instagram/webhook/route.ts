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
    let body: any = {};
    const text = await request.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (err) {
        console.warn('[Instagram Webhook] Could not parse JSON body, text was:', text);
        try {
          body = Object.fromEntries(new URLSearchParams(text));
        } catch {
          body = {};
        }
      }
    }

    // Soporte directo para ManyChat / Zapier / Make / Webhook Relay plano:
    // ManyChat envía campos como: ig_username, username, first_name, last_name, last_input_text, message, id, etc.
    if (body.customerHandle || body.senderId || body.message || body.text || body.last_input_text || body.ig_username || body.subscriber_id) {
      const rawHandle = body.customerHandle || body.ig_username || body.username || (body.subscriber_id ? `user_${body.subscriber_id}` : 'cliente_instagram');
      const senderHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
      
      const fullName = [body.first_name, body.last_name].filter(Boolean).join(' ');
      const senderName = body.customerName || fullName || body.name || body.username || body.ig_username || 'Cliente Instagram';
      const senderAvatar = body.customerAvatar || body.profile_pic || body.avatar || undefined;
      const messageText = body.message || body.text || body.content || body.last_input_text || '';
      const convId = body.conversationId || `conv-ig-${(senderHandle || 'user').replace(/[^a-zA-Z0-9]/g, '_')}`;

      if (messageText) {
        // Cargar conversaciones existentes de Supabase
        const { data: currentMeta } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', 'meta-customer-service')
          .maybeSingle();

        const existingConversations: CustomerConversation[] =
          currentMeta && Array.isArray(currentMeta.subtasks) ? currentMeta.subtasks : [];

        const convIndex = existingConversations.findIndex(
          (c) => c.customerHandle.toLowerCase() === senderHandle.toLowerCase() || c.id === convId
        );

        let updatedConversations: CustomerConversation[];
        if (convIndex >= 0) {
          const updatedConv: CustomerConversation = {
            ...existingConversations[convIndex],
            customerName: senderName || existingConversations[convIndex].customerName,
            customerHandle: senderHandle || existingConversations[convIndex].customerHandle,
            customerAvatar: senderAvatar || existingConversations[convIndex].customerAvatar,
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
            id: convId,
            platform: 'instagram',
            customerHandle: senderHandle,
            customerName: senderName,
            customerAvatar: senderAvatar,
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

        const existingList = existingMessagesMap[convId] || [];
        const timeStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

        const newMsg: CustomerMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          conversationId: convId,
          sender: 'customer',
          senderName: senderName,
          content: messageText,
          timestamp: timeStr,
          status: 'sent',
        };

        const updatedMessagesMap = {
          ...existingMessagesMap,
          [convId]: [...existingList, newMsg],
        };

        const { error: upsertErr1 } = await supabase.from('tasks').upsert({
          id: 'meta-customer-service',
          title: 'Bandeja de Atención a Clientes (Instagram DMs & CRM)',
          description: 'Conversaciones y prospectos de redes sociales',
          status: 'done',
          priority: 'medium',
          assigned_to: 'partner-1',
          category: 'Ventas',
          subtasks: updatedConversations,
        });

        const { error: upsertErr2 } = await supabase.from('tasks').upsert({
          id: 'meta-customer-messages',
          title: 'Historial de Mensajes de Clientes (Instagram & CRM)',
          description: 'Mensajes individuales indexados por ID de conversación',
          status: 'done',
          priority: 'medium',
          assigned_to: 'partner-1',
          category: 'Ventas',
          subtasks: [updatedMessagesMap],
        });

        try {
          supabase.channel('migalia_presence').send({
            type: 'broadcast',
            event: 'data_changed',
            payload: { entity: 'customer_service' },
          });
        } catch (e) {}

        return NextResponse.json({
          status: 'EVENT_RECEIVED',
          success: true,
          convCount: updatedConversations.length,
          upsertErr1: upsertErr1?.message || null,
          upsertErr2: upsertErr2?.message || null,
          keySnippet: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'using_default').slice(0, 15),
          urlSnippet: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'using_default'),
        }, { status: 200 });
      }
    }

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

            let customerName = `Usuario Instagram (${senderId.slice(-4)})`;
            let customerHandle = `@ig_user_${senderId.slice(-4)}`;
            let customerAvatar: string | undefined = undefined;

            const igToken = process.env.INSTAGRAM_USER_ACCESS_TOKEN || 'IGAANfgVCgKLdBZAFlZAVzFYNS0yZAnVYZAy11cWhFcURwbXNNSWVLck11ZA3lIaDlxMjZAXU0J1dkRZAdk9PNkw3OEpVdkJiNmRYckdMaEIxODBocDZAOWTJ3SUFSM1pIU0lIblhNbTl3dGphSk5jT1pncERqUlFyN0pHZATF3dkFBM09XVQZDZD';
            if (igToken) {
              try {
                const profileRes = await fetch(
                  `https://graph.instagram.com/v22.0/${senderId}?fields=name,username,profile_pic&access_token=${igToken}`
                );
                if (profileRes.ok) {
                  const profileData = await profileRes.json();
                  if (profileData.username) customerHandle = `@${profileData.username}`;
                  if (profileData.name) customerName = profileData.name;
                  else if (profileData.username) customerName = profileData.username;
                  if (profileData.profile_pic) customerAvatar = profileData.profile_pic;
                }
              } catch (fetchProfileErr) {
                console.warn('[Instagram Webhook] No se pudo obtener perfil de IG:', fetchProfileErr);
              }
            }

            let updatedConversations: CustomerConversation[];

            if (convIndex >= 0) {
              const updatedConv: CustomerConversation = {
                ...existingConversations[convIndex],
                customerName: existingConversations[convIndex].customerName || customerName,
                customerHandle: existingConversations[convIndex].customerHandle || customerHandle,
                customerAvatar: existingConversations[convIndex].customerAvatar || customerAvatar,
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
                customerHandle,
                customerName,
                customerAvatar,
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

            const timeStr = timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

            const newMsg: CustomerMessage = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              conversationId: convId,
              sender: 'customer',
              senderName: customerName,
              content: messageText,
              timestamp: timeStr,
              status: 'sent',
            };

            const updatedMessagesMap = {
              ...existingMessagesMap,
              [convId]: [...existingList, newMsg],
            };

            // Guardar en Supabase y emitir presencia en tiempo real
            const { error: convErr } = await supabase.from('tasks').upsert({
              id: 'meta-customer-service',
              title: 'Bandeja de Atención a Clientes (Instagram DMs & CRM)',
              description: 'Conversaciones y prospectos de redes sociales',
              status: 'done',
              priority: 'medium',
              assigned_to: 'partner-1',
              category: 'Ventas',
              subtasks: updatedConversations,
            });

            if (convErr) {
              console.error('[Instagram Webhook] Error guardando conversaciones:', convErr);
            }

            const { error: msgErr } = await supabase.from('tasks').upsert({
              id: 'meta-customer-messages',
              title: 'Historial de Mensajes de Clientes (Instagram & CRM)',
              description: 'Mensajes individuales indexados por ID de conversación',
              status: 'done',
              priority: 'medium',
              assigned_to: 'partner-1',
              category: 'Ventas',
              subtasks: [updatedMessagesMap],
            });

            if (msgErr) {
              console.error('[Instagram Webhook] Error guardando mensajes:', msgErr);
            }

            try {
              supabase.channel('migalia_presence').send({
                type: 'broadcast',
                event: 'data_changed',
                payload: { entity: 'customer_service' },
              });
            } catch (broadcastErr) {
              console.warn('[Instagram Webhook] Error enviando broadcast:', broadcastErr);
            }
          }
        }
      }

      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error: any) {
    console.error('[Instagram Webhook Error]', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error?.message || String(error),
      stack: error?.stack,
    }, { status: 500 });
  }
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Partner, ChatMessage } from '@/types';
import {
  MessageSquare,
  Video,
  Send,
  X,
  Minimize2,
  Maximize2,
  ChevronDown,
  WifiOff,
  Clock,
} from 'lucide-react';

import { soundManager } from '@/lib/soundEffects';
import { supabase } from '@/lib/supabase';

interface PartnersChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPartner: Partner | null;
  partners: Partner[];
  onLaunchMeeting: (title?: string) => void;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const PartnersChatDrawer: React.FC<PartnersChatDrawerProps> = ({
  isOpen,
  onClose,
  currentPartner,
  partners,
  onLaunchMeeting,
  messages,
  onSendMessage,
  isMinimized: externalMinimized,
  onToggleMinimize,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [remoteTyping, setRemoteTyping] = useState<string | null>(null);
  const [internalMinimized, setInternalMinimized] = useState(false);
  const isMinimized = externalMinimized !== undefined ? externalMinimized : internalMinimized;
  const toggleMinimize = onToggleMinimize || (() => setInternalMinimized(!internalMinimized));
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Escuchar y emitir estado "Escribiendo..." con Supabase Broadcast
  useEffect(() => {
    const channel = supabase.channel('migalia_chat_realtime');

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload?.senderId !== currentPartner?.id) {
          setRemoteTyping(payload?.senderName || 'Tu socio');
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setRemoteTyping(null);
          }, 2500);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPartner]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, remoteTyping]);

  if (!isOpen) return null;

  const handleInputChange = (val: string) => {
    setInputMessage(val);
    if (val.trim()) {
      try {
        supabase.channel('migalia_chat_realtime').send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            senderId: currentPartner?.id,
            senderName: currentPartner?.shortName || 'Socio',
          },
        });
      } catch (e) {}
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentPartner?.id || 'mario',
      senderName: currentPartner?.shortName || 'Mario',
      content: inputMessage.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSendMessage(newMsg);
    soundManager.playChatPop();
    setInputMessage('');
  };

  const handleShareMeetingInvite = () => {
    const meetingTitle = `Reunión de Socios (${new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })})`;
    const inviteMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentPartner?.id || 'mario',
      senderName: currentPartner?.shortName || 'Mario',
      content: `🎥 He iniciado una sesión en vivo en Migalia: "${meetingTitle}". Únete para revisar acuerdos y levantar la minuta por voz.`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMeetingInvite: true,
      meetingTitle,
    };

    onSendMessage(inviteMsg);
    onLaunchMeeting(meetingTitle);
  };

  const otherPartner = partners.find((p) => {
    if (!currentPartner) return true;
    const isSameId = p.id === currentPartner.id;
    const isSameEmail = Boolean(p.email && currentPartner.email && p.email.toLowerCase() === currentPartner.email.toLowerCase());
    const isSameName = Boolean(p.name && currentPartner.name && p.name.toLowerCase() === currentPartner.name.toLowerCase());
    return !isSameId && !isSameEmail && !isSameName;
  });
  const isOtherPartnerOnline = Boolean(otherPartner?.isOnline);

  return (
    <aside
      aria-label="Ventana flotante de chat entre socios"
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out pointer-events-auto select-none ${
        isMinimized
          ? 'w-72 h-14'
          : isExpanded
          ? 'w-[520px] max-w-[95vw] h-[640px] max-h-[85vh]'
          : 'w-96 max-w-[92vw] h-[520px] max-h-[80vh]'
      }`}
    >
      <div className="bg-white text-stone-900 w-full h-full rounded-2xl shadow-2xl border border-stone-300/80 flex flex-col overflow-hidden ring-1 ring-black/10">
        {/* Header de la Ventana Flotante */}
        <div
          onClick={() => isMinimized && toggleMinimize()}
          className="px-3.5 py-2.5 bg-stone-900 text-white flex items-center justify-between cursor-pointer select-none shrink-0 border-b border-stone-800"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative p-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl shrink-0">
              <MessageSquare className="w-4 h-4" />
              {isOtherPartnerOnline && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-stone-900 rounded-full animate-pulse" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-stone-100 truncate">
                  Chat de Socios
                </h3>
                {isOtherPartnerOnline ? (
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
                    {otherPartner?.shortName || 'Socio'}: En línea
                  </span>
                ) : (
                  <span className="text-[9px] text-stone-400 font-medium bg-stone-800 px-1.5 py-0.2 rounded">
                    {otherPartner?.shortName || 'Socio'}: Offline
                  </span>
                )}
              </div>
              {!isMinimized && (
                <p className="text-[10px] text-stone-400 truncate">
                  {currentPartner?.shortName || 'Mario'} & {otherPartner?.shortName || 'Susy'} · Migalia
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {!isMinimized && (
              <>
                <button
                  type="button"
                  onClick={() => handleShareMeetingInvite()}
                  className="flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition shadow-xs"
                  title="Iniciar Meet y avisar por chat"
                >
                  <Video className="w-3 h-3" />
                  <span>Meet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
                  title={isExpanded ? 'Tamaño normal' : 'Expandir ventana'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={toggleMinimize}
              className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
              title={isMinimized ? 'Restaurar' : 'Minimizar'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMinimized ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Chat (visible cuando no está minimizado) */}
        {!isMinimized && (
          <>
            {/* Mensajes */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#FBF9F4] select-text">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentPartner?.id || msg.senderName === currentPartner?.shortName;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 mb-0.5 text-[10px] text-stone-400">
                      <span className="font-bold text-stone-600">{msg.senderName}</span>
                      <span>· {msg.createdAt}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[88%] leading-relaxed break-words shadow-xs ${
                        isMe
                          ? 'bg-stone-900 text-white rounded-tr-none'
                          : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* Tarjeta de Invitación a Meet */}
                      {msg.isMeetingInvite && (
                        <div className="mt-2 pt-2 border-t border-stone-200/40">
                          <button
                            type="button"
                            onClick={() => onLaunchMeeting(msg.meetingTitle)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-[10px] transition shadow-xs"
                          >
                            <Video className="w-3 h-3" />
                            <span>Entrar a la Sala / Minuta</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Indicador de Socio Escribiendo */}
              {remoteTyping && (
                <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-white/90 border border-stone-200 px-2.5 py-1.5 rounded-xl w-fit animate-pulse">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </span>
                  <span className="font-medium">{remoteTyping} está escribiendo...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Barra de Entrada de Mensaje con Aviso Offline */}
            <div className="p-2.5 bg-white border-t border-stone-200 shrink-0 space-y-2">
              {!isOtherPartnerOnline && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-tight animate-in fade-in duration-200">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 shrink-0">
                    <Clock className="w-3 h-3 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-950 truncate">
                      {otherPartner?.shortName || otherPartner?.name || 'Tu socio/a'} no está en línea
                    </p>
                    <p className="text-[10px] text-amber-800/90">
                      Por el momento está offline. Recibirá tu mensaje en cuanto abra la plataforma.
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  placeholder={
                    !isOtherPartnerOnline
                      ? `Escribe a ${otherPartner?.shortName || 'tu socio/a'} (lo verá al conectar)...`
                      : 'Escribe aquí... (Enter para enviar)'
                  }
                  value={inputMessage}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all select-text"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-stone-900 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-stone-900 text-white rounded-xl transition shadow-xs shrink-0"
                  title="Enviar mensaje"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};


'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Partner, ChatMessage } from '@/types';
import {
  MessageSquare,
  Video,
  Send,
  X,
  Sparkles,
  Users,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface PartnersChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPartner: Partner | null;
  partners: Partner[];
  onLaunchMeeting: (title?: string) => void;
}

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'partner-1',
    senderName: 'Mario',
    content: 'Hola Susy, acabo de revisar la cotización del horno de convección y el borrador de las cláusulas para la visa E-2.',
    createdAt: '10:15 AM',
  },
  {
    id: 'msg-2',
    senderId: 'partner-2',
    senderName: 'Susy',
    content: '¡Perfecto Mario! Ya terminé el costeo oficial de las Cookie Fries con el dip de frutos rojos. Los márgenes quedaron arriba del 78%.',
    createdAt: '10:22 AM',
  },
];

export const PartnersChatDrawer: React.FC<PartnersChatDrawerProps> = ({
  isOpen,
  onClose,
  currentPartner,
  partners,
  onLaunchMeeting,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const local = localStorage.getItem('migalia_partners_chat');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_CHAT_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('migalia_partners_chat', JSON.stringify(messages));
    } catch (e) {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentPartner?.id || 'mario',
      senderName: currentPartner?.shortName || 'Mario',
      content: inputMessage.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
  };

  const handleShareMeetingInvite = () => {
    const meetingTitle = `Reunión de Socios (${new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })})`;
    const inviteMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: currentPartner?.id || 'mario',
      senderName: currentPartner?.shortName || 'Mario',
      content: `🎥 He iniciado una sesión en vivo en Migalia Meets: "${meetingTitle}". Únete para revisar acuerdos y levantar la minuta por voz.`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMeetingInvite: true,
      meetingTitle,
    };

    setMessages((prev) => [...prev, inviteMsg]);
    onLaunchMeeting(meetingTitle);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-stone-200 flex flex-col justify-between overflow-hidden">
        {/* Header del Chat */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm">Chat Interno de Socios</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-stone-400">Mario & Susy · Migalia Puebla</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleShareMeetingInvite()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              title="Lanzar videollamada y enviar invitación al chat"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Meet</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F6F0]/60">
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
                  className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    isMe
                      ? 'bg-stone-900 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Tarjeta de Invitación a Meet */}
                  {msg.isMeetingInvite && (
                    <div className="mt-2.5 pt-2.5 border-t border-stone-200/40">
                      <button
                        onClick={() => onLaunchMeeting(msg.meetingTitle)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] transition shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Entrar a la Sala / Levantar Minuta</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Entrada y Acciones Rápidas */}
        <div className="p-3 bg-white border-t border-stone-200 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Escribe un mensaje para los socios..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition shadow-xs"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span>Presiona <strong>Meet</strong> arriba para iniciar sesión en video.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

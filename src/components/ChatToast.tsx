'use client';

import React, { useEffect } from 'react';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import { ChatMessage } from '@/types';

interface ChatToastProps {
  notification: {
    message: ChatMessage;
    senderAvatar?: string;
  };
  onOpenChat: () => void;
  onDismiss: () => void;
}

export const ChatToast: React.FC<ChatToastProps> = ({
  notification,
  onOpenChat,
  onDismiss,
}) => {
  const { message, senderAvatar } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
      <div className="bg-stone-900/95 backdrop-blur-md text-white border border-amber-500/40 shadow-2xl rounded-2xl p-4 w-88 max-w-[90vw] transition-all hover:border-amber-500/80">
        <div className="flex items-start gap-3">
          {/* Avatar del remitente */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center shrink-0 shadow-md ring-2 ring-amber-500/30">
            {senderAvatar || message.senderName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-amber-300 truncate">
                {message.senderName}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {message.createdAt}
              </span>
            </div>

            <p className="text-xs text-stone-200 mt-1 line-clamp-2 leading-relaxed">
              {message.content}
            </p>

            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => {
                  onOpenChat();
                  onDismiss();
                }}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg transition-colors"
              >
                Responder <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

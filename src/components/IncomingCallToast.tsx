'use client';

import React, { useEffect } from 'react';
import { Video, Phone, PhoneOff, Radio } from 'lucide-react';
import { soundManager } from '@/lib/soundEffects';

interface IncomingCallToastProps {
  callerName: string;
  meetingTitle?: string;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallToast: React.FC<IncomingCallToastProps> = ({
  callerName,
  meetingTitle,
  onAccept,
  onReject,
}) => {
  useEffect(() => {
    soundManager.startIncomingCallRingtone();
    return () => {
      soundManager.stopIncomingCallRingtone();
    };
  }, []);

  const handleAccept = () => {
    soundManager.stopIncomingCallRingtone();
    onAccept();
  };

  const handleReject = () => {
    soundManager.stopIncomingCallRingtone();
    onReject();
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-stone-950 text-white border-2 border-amber-500/50 shadow-2xl rounded-2xl p-4 w-96 max-w-[90vw] backdrop-blur-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Video className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-950 animate-ping" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Llamada Entrante
              </span>
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                <Radio className="w-2.5 h-2.5 text-emerald-400" /> En Vivo
              </span>
            </div>
            <h4 className="text-sm font-bold text-stone-100 truncate mt-0.5">
              {callerName} te está llamando
            </h4>
            <p className="text-[11px] text-stone-400 truncate">
              {meetingTitle || 'Sesión de acuerdos y planeación'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Rechazar</span>
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-100 animate-bounce" />
            <span>Unirse a la Sala</span>
          </button>
        </div>
      </div>
    </div>
  );
};

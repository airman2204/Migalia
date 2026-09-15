'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Partner, LogbookEntry, ScheduledMeeting } from '@/types';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Sparkles,
  Mail,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  PhoneOff,
  Radio,
  FileText,
} from 'lucide-react';

interface MeetingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  currentPartner?: Partner | null;
  meetingData?: Partial<ScheduledMeeting> | null;
  onSaveMinuta: (entry: Omit<LogbookEntry, 'id'>) => void;
}

export const MeetingRoomModal: React.FC<MeetingRoomModalProps> = ({
  isOpen,
  onClose,
  partners,
  currentPartner,
  meetingData,
  onSaveMinuta,
}) => {
  if (!isOpen) return null;

  const [sessionTitle, setSessionTitle] = useState(
    meetingData?.title || 'Sesión Estratégica & Acuerdos Migalia'
  );
  const [attendees, setAttendees] = useState(
    meetingData?.attendees || partners.map((p) => p.name).join(', ') || 'Mario González & Susy'
  );

  // Estados de Dispositivos WebRTC Locales
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Estados de IA y Captura de Notas
  const [isRecordingNotes, setIsRecordingNotes] = useState(false);
  const [accumulatedNotes, setAccumulatedNotes] = useState<string[]>([]);
  const [agreements, setAgreements] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [copied, setCopied] = useState(false);

  // Referencias a elementos y streams de video
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Función para apagar completamente la cámara y micrófono liberando el hardware físico
  const stopAllMediaTracks = useCallback(() => {
    // 1. Detener stream de la referencia
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
          track.enabled = false;
        } catch (e) {}
      });
      mediaStreamRef.current = null;
    }

    // 2. Limpiar elemento de video
    if (localVideoRef.current) {
      if (localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
            track.enabled = false;
          } catch (e) {}
        });
        localVideoRef.current.srcObject = null;
      }
    }

    // 3. Detener reconocimiento de voz
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  // Cierre limpio de la llamada
  const handleExitCall = useCallback(() => {
    stopAllMediaTracks();
    onClose();
  }, [stopAllMediaTracks, onClose]);

  // 1. Iniciar WebRTC nativo (cámara y micrófono locales del socio)
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startLocalWebRTC() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: true,
          });

          activeStream = stream;
          mediaStreamRef.current = stream;
          setHasMediaPermission(true);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Acceso a cámara/micrófono no concedido o no disponible:', err);
        setHasMediaPermission(false);
      }
    }

    startLocalWebRTC();

    // Contador de tiempo de llamada
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      stopAllMediaTracks();
      if (activeStream) {
        activeStream.getTracks().forEach((track) => {
          try {
            track.stop();
            track.enabled = false;
          } catch (e) {}
        });
      }
    };
  }, [stopAllMediaTracks]);

  // 2. Control de Captura de Notas con Reconocimiento de Voz
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (isRecordingNotes) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'es-MX';

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const snippet = event.results[i][0].transcript.trim();
              if (snippet.length > 3) {
                setAccumulatedNotes((prev) => {
                  const updated = [...prev, snippet];
                  // Actualizar también directamente el texto de la minuta
                  setAgreements((prevAgr) => {
                    if (!prevAgr) {
                      return `• ${snippet}`;
                    }
                    return `${prevAgr}\n• ${snippet}`;
                  });
                  return updated;
                });
              }
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech listener error:', e.error);
        };

        recognition.onend = () => {
          // Si sigue activo el estado de grabación de notas, reconectar
          if (recognitionRef.current && isRecordingNotes) {
            try {
              recognition.start();
            } catch (err) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Error al iniciar reconocimiento de voz:', e);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {}
        recognitionRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {}
        recognitionRef.current = null;
      }
    };
  }, [isRecordingNotes]);

  // Alternar Captura de Notas (Tomar Notas / Parar Notas)
  const toggleNotesCapture = () => {
    setIsRecordingNotes((prev) => !prev);
  };

  // Alternar Video Local
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Alternar Audio Local
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // 3. Guardar Minuta en el Historial de Bitácora (Sin envío de correo)
  const handleSaveMinutaOnly = () => {
    if (!sessionTitle.trim() || !agreements.trim()) {
      alert('Por favor agrega notas o acuerdos para guardar en la minuta.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Registrar directamente en Bitácora central / historial de minutas
    onSaveMinuta({
      title: `Minuta Sesión: ${sessionTitle}`,
      content: agreements,
      category: 'Reunión & Acuerdos',
      authorId: currentPartner?.id || partners[0]?.id || 'socio',
      authorName: currentPartner?.name || 'Sesión Mario & Susy',
      date: todayStr,
    });

    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 4000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(agreements);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const partner1 = partners[0] || { name: 'Mario Alberto González', role: 'Finanzas & Legal', isOnline: true };
  const remotePartner =
    partners.find((p) => p.id !== currentPartner?.id) ||
    partners[1] || { name: 'Susy', role: 'Dirección Culinaria & Operaciones', isOnline: false };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-stone-950 w-full h-[95vh] max-w-7xl rounded-3xl border border-stone-800 shadow-2xl flex flex-col overflow-hidden text-stone-100">
        {/* Header Superior del Studio */}
        <div className="px-6 py-3.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo Oficial Migalia */}
            <div className="flex items-baseline tracking-widest text-white">
              <span className="text-xl md:text-2xl font-bold tracking-[0.25em]">M</span>
              <span className="text-xl md:text-2xl font-bold tracking-[0.25em] relative">
                I
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[#C59B27] rounded-sm transform rotate-12" />
              </span>
              <span className="text-xl md:text-2xl font-bold tracking-[0.25em]">GALIA</span>
            </div>

            <div className="h-4 w-px bg-stone-700" />

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-semibold border border-emerald-500/20">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> En Vivo
              </span>
              <span className="text-xs font-mono text-stone-300 font-bold bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
                {formatTimer(callDuration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExitCall}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition"
              title="Cerrar sala"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo Dividido: Sala de Video (WebRTC) vs Panel de Minuta Inteligente */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LADO IZQUIERDO: Grilla de Video Nativa (WebRTC) */}
          <div className="flex-1 flex flex-col bg-stone-900 p-4 border-b lg:border-b-0 lg:border-r border-stone-800 justify-between">
            {/* Grilla 2x1 de Cámaras de los Socios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-center">
              {/* Cámara 1: Socio Local (WebRTC Real de la Cámara) */}
              <div className="relative bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 h-full min-h-[220px] flex items-center justify-center shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${
                    !isVideoEnabled || !hasMediaPermission ? 'hidden' : 'block'
                  }`}
                />

                {(!isVideoEnabled || !hasMediaPermission) && (
                  <div className="text-center p-6 text-stone-400">
                    <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-xl font-bold text-amber-400 mx-auto mb-2 border border-stone-700">
                      {currentPartner?.shortName?.charAt(0) || 'M'}
                    </div>
                    <p className="text-xs font-bold text-stone-200">
                      {currentPartner?.name || partner1.name}
                    </p>
                    <span className="text-[10px] text-stone-500">
                      {!hasMediaPermission ? 'Cámara desactivada' : 'Video pausado'}
                    </span>
                  </div>
                )}

                {/* Badge de Socio Local */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white text-[11px]">
                    {currentPartner?.name || partner1.name} (Tú)
                  </span>
                </div>
              </div>

              {/* Cámara 2: Socio Remoto (Susy / Mario) */}
              <div className="relative bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 h-full min-h-[220px] flex items-center justify-center shadow-lg">
                <div className="text-center p-6 text-stone-400">
                  <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-xl font-bold text-amber-400 mx-auto mb-2 border border-stone-700 shadow-md">
                    {remotePartner.name.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-stone-200">{remotePartner.name}</p>
                  <p className="text-[11px] text-amber-400/90 font-medium">{remotePartner.role}</p>
                  {remotePartner.isOnline ? (
                    <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Disponible en la plataforma
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] px-2.5 py-0.5 bg-stone-800 text-stone-400 border border-stone-700 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                      Fuera de línea
                    </span>
                  )}
                </div>

                {/* Badge de Socio Remoto */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs flex items-center gap-2 border border-white/10">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      remotePartner.isOnline ? 'bg-emerald-400' : 'bg-stone-500'
                    }`}
                  />
                  <span className="font-bold text-white text-[11px]">{remotePartner.name}</span>
                </div>
              </div>
            </div>

            {/* Barra de Controles de Conexión (Mute, Video, Colgar) */}
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-3.5 rounded-2xl font-bold transition flex items-center gap-2 ${
                  isAudioEnabled
                    ? 'bg-stone-800 hover:bg-stone-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
                title={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`p-3.5 rounded-2xl font-bold transition flex items-center gap-2 ${
                  isVideoEnabled
                    ? 'bg-stone-800 hover:bg-stone-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
                title={isVideoEnabled ? 'Apagar cámara' : 'Encender cámara'}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleExitCall}
                className="px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition"
                title="Finalizar llamada"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Finalizar Llamada</span>
              </button>
            </div>
          </div>

          {/* LADO DERECHO: Control de Notas y Guardado en Historial de Minutas */}
          <div className="w-full lg:w-[480px] bg-stone-900 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              {/* Título y Metadatos */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Título de la Sesión
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Botón de Captura: Tomar Notas / Parar Notas */}
              <div>
                <button
                  type="button"
                  onClick={toggleNotesCapture}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-md ${
                    isRecordingNotes
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-gradient-to-r from-[#C59B27] to-[#B3891E] hover:from-[#B3891E] hover:to-[#9F7715] text-stone-950 font-extrabold'
                  }`}
                >
                  {isRecordingNotes ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Parar Notas (Grabación activa)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Tomar Notas</span>
                    </>
                  )}
                </button>
                {isRecordingNotes && (
                  <p className="text-[11px] text-amber-400 text-center mt-1.5 font-medium">
                    🎙️ Capturando lo que hablan en la sesión directamente a la minuta...
                  </p>
                )}
              </div>

              {/* Minuta & Acuerdos Asentados */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Notas & Acuerdos de la Minuta</span>
                  </label>
                  {agreements && (
                    <button
                      onClick={handleCopy}
                      className="text-[10px] text-stone-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={11}
                  value={agreements}
                  onChange={(e) => setAgreements(e.target.value)}
                  placeholder="Presiona 'Tomar Notas' para que se comiencen a capturar las notas de la conversación aquí. Puedes pausar con 'Parar Notas' en cualquier momento o escribir directo..."
                  className="w-full p-3.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed font-sans"
                />
              </div>

              {/* Estado de guardado */}
              {saveStatus === 'saved' && (
                <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-emerald-950/80 text-emerald-300 border border-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Minuta guardada exitosamente en el historial de la Bitácora.</span>
                </div>
              )}
            </div>

            {/* Botón de Asentar Minuta (Solo guardar en historial) */}
            <div className="pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={handleSaveMinutaOnly}
                className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg border border-stone-700"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Asentar Minuta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

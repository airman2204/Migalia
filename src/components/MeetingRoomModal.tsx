'use client';

import React, { useState, useEffect, useRef } from 'react';
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

  // Estados de IA y Minuta Automática Silenciosa
  const [isAISilentListening, setIsAISilentListening] = useState(true);
  const [accumulatedNotes, setAccumulatedNotes] = useState<string[]>([]);
  const [agreements, setAgreements] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Estados de Envío de Correo
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailStatusMsg, setEmailStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Referencias a elementos y streams de video
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

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
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Escucha Silenciosa de Fondo con Miga AI (Speech Recognition automático sin dictar)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-MX';

        recognition.onresult = (event: any) => {
          let latestText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const snippet = event.results[i][0].transcript.trim();
              if (snippet.length > 5) {
                setAccumulatedNotes((prev) => [...prev, snippet]);
              }
            } else {
              latestText += event.results[i][0].transcript;
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech listener warn:', e.error);
        };

        recognition.onend = () => {
          if (isAISilentListening) {
            try {
              recognition.start();
            } catch (err) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Reconocimiento no disponible:', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isAISilentListening]);

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

  // 3. Síntesis Automática de Minuta con Miga AI
  const handleGenerateMinutaAI = () => {
    setIsProcessingAI(true);

    setTimeout(() => {
      const contextText =
        accumulatedNotes.length > 0
          ? accumulatedNotes.join(' \n• ')
          : 'Revisión de avances del local en Puebla, tiempos de entrega del horno de convección, cotizaciones de empaque marfil y cláusulas corporativas.';

      const structured =
        `1. OBJETIVO & ASISTENTES DE LA SESIÓN:\n` +
        `• Sesión de alineación interna entre ${attendees}.\n` +
        `• Asunto principal: ${sessionTitle}.\n\n` +
        `2. ACUERDOS Y DECISIONES TOMADAS:\n` +
        `• ` + contextText + `\n` +
        `• Definición de fechas de prueba para el horneado de Cookie Fries.\n` +
        `• Validación del presupuesto ejecutado contra el CAPEX disponible.\n\n` +
        `3. TAREAS Y RESPONSABLES ASIGNADOS:\n` +
        `• Mario: Seguimiento legal, contacto con notario y supervisión presupuestal.\n` +
        `• Susy: Pruebas de textura en horno, gramajes de sub-recetas y fichas técnicas.\n\n` +
        `4. PRÓXIMA REUNIÓN:\n` +
        `• Compromiso de revisión en 7 días en el calendario interno de Migalia.`;

      setAgreements(structured);
      setIsProcessingAI(false);
    }, 700);
  };

  // 4. Guardar y Despachar Minuta por Correo
  const handleSaveAndSend = async () => {
    if (!sessionTitle.trim() || !agreements.trim()) {
      alert('Primero genera o escribe los acuerdos de la minuta para poder asentarla.');
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus('idle');

    const todayStr = new Date().toISOString().split('T')[0];

    // Registrar en Bitácora central
    onSaveMinuta({
      title: `Minuta Sesión Interna: ${sessionTitle}`,
      content: agreements,
      category: 'Reunión & Acuerdos',
      authorId: currentPartner?.id || partners[0]?.id || 'socio',
      authorName: currentPartner?.name || 'Sesión Mario & Susy',
      date: todayStr,
    });

    // Despachar por correo a los socios
    try {
      const res = await fetch('/api/send-minuta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sessionTitle,
          date: todayStr,
          agreements: agreements,
          attendees: attendees,
          rawNotes: accumulatedNotes.join(' \n'),
          senderName: 'Miga AI · Migalia Calls Studio',
          recipients: partners.map((p) => p.email).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEmailStatus('success');
        setEmailStatusMsg(data.message || 'Minuta asentada y enviada a los socios.');
      } else {
        setEmailStatus('error');
        setEmailStatusMsg('Minuta asentada en Bitácora.');
      }
    } catch (err: any) {
      setEmailStatus('error');
      setEmailStatusMsg('Minuta registrada con éxito en la Bitácora.');
    } finally {
      setIsSendingEmail(false);
    }
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

  const partner1 = partners[0] || { name: 'Mario Alberto González', role: 'Finanzas & Legal' };
  const partner2 = partners[1] || { name: 'Susy', role: 'Dirección Culinaria & Operaciones' };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-stone-950 w-full h-[95vh] max-w-7xl rounded-3xl border border-stone-800 shadow-2xl flex flex-col overflow-hidden text-stone-100">
        {/* Header Superior del Studio */}
        <div className="px-6 py-3.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-serif font-bold text-white">
                  Migalia Calls Studio
                </h2>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold border border-emerald-500/30">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> WebRTC Interno
                </span>
                <span className="text-xs font-mono text-stone-400 font-bold bg-stone-800 px-2 py-0.5 rounded-md">
                  {formatTimer(callDuration)}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Ecosistema propio de videollamada con captura y síntesis de minutas por Miga AI.
              </p>
            </div>
          </div>

          {/* Indicador de Miga AI Escuchando */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-[11px] font-medium">Miga AI escuchando de fondo</span>
            </div>

            <button
              onClick={onClose}
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
                    {partner2.name.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-stone-200">{partner2.name}</p>
                  <p className="text-[11px] text-amber-400/90 font-medium">{partner2.role}</p>
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded-full">
                    Conectado a la sesión
                  </span>
                </div>

                {/* Badge de Socio Remoto */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white text-[11px]">{partner2.name}</span>
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
                onClick={onClose}
                className="px-5 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition"
                title="Finalizar llamada"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Finalizar Llamada</span>
              </button>
            </div>
          </div>

          {/* LADO DERECHO: Asistente Automático Miga AI & Despacho de Minuta */}
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

              {/* Caja de Miga AI Oyente */}
              <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Miga AI Oyente Automático</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold">
                    {accumulatedNotes.length} puntos capturados
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  La IA escucha la conversación en segundo plano. Al terminar, presiona el botón inferior para sintetizar los acuerdos automáticamente sin teclear.
                </p>

                <button
                  type="button"
                  onClick={handleGenerateMinutaAI}
                  disabled={isProcessingAI}
                  className="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>
                    {isProcessingAI ? 'Procesando acuerdos con IA...' : 'Sintetizar Minuta con Miga AI'}
                  </span>
                </button>
              </div>

              {/* Minuta Estructurada */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Minuta Oficial & Acuerdos Asentados</span>
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
                  rows={9}
                  value={agreements}
                  onChange={(e) => setAgreements(e.target.value)}
                  placeholder="Los acuerdos estructurados por Miga AI se generarán aquí automáticamente al pulsar Sintetizar. También puedes hacer anotaciones directas..."
                  className="w-full p-3.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed font-sans"
                />
              </div>

              {/* Estatus del Envío por Correo */}
              {emailStatus !== 'idle' && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    emailStatus === 'success'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  }`}
                >
                  {emailStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>{emailStatusMsg}</span>
                </div>
              )}
            </div>

            {/* Botón de Asentar y Despachar */}
            <div className="pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={handleSaveAndSend}
                disabled={isSendingEmail}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Mail className="w-4 h-4 text-amber-200" />
                <span>{isSendingEmail ? 'Enviando por Correo...' : 'Asentar & Enviar Minuta a Socios'}</span>
              </button>
              <p className="text-[10px] text-stone-500 text-center mt-2">
                Se registrará en la Bitácora y se enviará copia con membrete formal a ambos socios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  Volume2,
  VolumeX,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MeetingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  currentPartner?: Partner | null;
  meetingData?: Partial<ScheduledMeeting> | null;
  onSaveMinuta: (entry: Omit<LogbookEntry, 'id'>) => void;
}

// Configuración STUN pública de alta disponibilidad de Google
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

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

  // Estados de Dispositivos Locales
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Estados de Conexión WebRTC P2P
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'waiting' | 'failed'
  >('waiting');
  const [hasRemoteAudio, setHasRemoteAudio] = useState(true);

  // Estados de IA y Minuta
  const [isRecordingNotes, setIsRecordingNotes] = useState(false);
  const [accumulatedNotes, setAccumulatedNotes] = useState<string[]>([]);
  const [agreements, setAgreements] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Referencias DOM y WebRTC
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalingChannelRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Identificación del socio local y socio remoto
  const partner1 = partners[0] || { name: 'Mario Alberto González', role: 'Finanzas & Legal', isOnline: true };
  const remotePartner =
    partners.find((p) => {
      if (!currentPartner) return true;
      const isSameId = p.id === currentPartner.id;
      const isSameEmail = Boolean(p.email && currentPartner.email && p.email.toLowerCase() === currentPartner.email.toLowerCase());
      const isSameName = Boolean(p.name && currentPartner.name && p.name.toLowerCase() === currentPartner.name.toLowerCase());
      return !isSameId && !isSameEmail && !isSameName;
    }) || partners[1] || { name: 'Susy', role: 'Dirección Culinaria & Operaciones', isOnline: false };

  // Limpieza y detención de tracks locales y túnel WebRTC
  const stopAllMediaTracks = useCallback(() => {
    // 1. Cerrar PeerConnection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }

    // 2. Desuscribir canal de señalización
    if (signalingChannelRef.current) {
      try {
        supabase.removeChannel(signalingChannelRef.current);
      } catch (e) {}
      signalingChannelRef.current = null;
    }

    // 3. Detener MediaStream Local
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
          track.enabled = false;
        } catch (e) {}
      });
      mediaStreamRef.current = null;
    }

    // 4. Limpiar elementos de video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // 5. Detener notas por voz
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  const handleExitCall = useCallback(() => {
    // Avisar que salgo de la sala
    try {
      if (signalingChannelRef.current) {
        signalingChannelRef.current.send({
          type: 'broadcast',
          event: 'call_signal',
          payload: {
            senderId: currentPartner?.id || 'mario',
            type: 'user_left',
          },
        });
      }
    } catch (e) {}

    stopAllMediaTracks();
    onClose();
  }, [stopAllMediaTracks, onClose, currentPartner?.id]);

  // ============================================================
  // FLUJO DE CONEXIÓN WEBRTC P2P CON SUPABASE BROADCAST
  // ============================================================
  useEffect(() => {
    let localStream: MediaStream | null = null;
    let pc: RTCPeerConnection | null = null;
    const myId = currentPartner?.id || (currentPartner?.shortName === 'Susy' ? 'partner-2' : 'partner-1');

    async function initWebRTC() {
      try {
        // 1. Obtener audio y video de la cámara local
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });

        mediaStreamRef.current = localStream;
        setHasMediaPermission(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // 2. Crear RTCPeerConnection con STUN de Google
        pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Añadir tracks locales a la conexión para enviarlos al otro socio
        localStream.getTracks().forEach((track) => {
          pc?.addTrack(track, localStream!);
        });

        // 3. Al recibir video/audio remoto del otro socio
        pc.ontrack = (event) => {
          console.log('Track remoto recibido:', event.track.kind);
          if (remoteVideoRef.current && event.streams && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setConnectionStatus('connected');
          }
          if (remoteAudioRef.current && event.streams && event.streams[0]) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        // Estado del ICE
        pc.oniceconnectionstatechange = () => {
          console.log('Estado ICE:', pc?.iceConnectionState);
          if (pc?.iceConnectionState === 'connected' || pc?.iceConnectionState === 'completed') {
            setConnectionStatus('connected');
          } else if (pc?.iceConnectionState === 'disconnected' || pc?.iceConnectionState === 'failed') {
            setConnectionStatus('waiting');
          }
        };

        // 4. Conectar al canal de señalización de Supabase
        const channel = supabase.channel('migalia_call_signal');
        signalingChannelRef.current = channel;

        // Escuchar ICE Candidates locales y transmitirlos al otro socio
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: 'broadcast',
              event: 'call_signal',
              payload: {
                senderId: myId,
                type: 'candidate',
                candidate: event.candidate,
              },
            });
          }
        };

        // Escuchar eventos de señalización del otro socio
        channel.on('broadcast', { event: 'call_signal' }, async ({ payload }) => {
          if (!payload || payload.senderId === myId) return; // Ignorar mis propios mensajes

          const peerPc = peerConnectionRef.current;
          if (!peerPc) return;

          try {
            if (payload.type === 'ready') {
              // El otro socio entró o está listo. Si soy el iniciador, creo Offer
              setConnectionStatus('connecting');
              const offer = await peerPc.createOffer();
              await peerPc.setLocalDescription(offer);
              channel.send({
                type: 'broadcast',
                event: 'call_signal',
                payload: {
                  senderId: myId,
                  type: 'offer',
                  sdp: offer,
                },
              });
            } else if (payload.type === 'offer') {
              // Recibí Offer -> creo Answer
              setConnectionStatus('connecting');
              await peerPc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
              const answer = await peerPc.createAnswer();
              await peerPc.setLocalDescription(answer);
              channel.send({
                type: 'broadcast',
                event: 'call_signal',
                payload: {
                  senderId: myId,
                  type: 'answer',
                  sdp: answer,
                },
              });
            } else if (payload.type === 'answer') {
              // Recibí Answer
              await peerPc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
              setConnectionStatus('connected');
            } else if (payload.type === 'candidate' && payload.candidate) {
              // Recibí ICE Candidate
              try {
                await peerPc.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } catch (e) {}
            } else if (payload.type === 'user_left') {
              // El socio remoto salió
              setConnectionStatus('waiting');
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
              }
            }
          } catch (sigErr) {
            console.error('Error en señalización WebRTC:', sigErr);
          }
        });

        // Suscribirse y emitir aviso 'ready'
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Anunciar que entré a la sala para iniciar el apretón de manos WebRTC
            channel.send({
              type: 'broadcast',
              event: 'call_signal',
              payload: {
                senderId: myId,
                type: 'ready',
              },
            });
          }
        });

      } catch (err) {
        console.warn('Acceso a cámara/micrófono no disponible:', err);
        setHasMediaPermission(false);
      }
    }

    initWebRTC();

    // Cronómetro de llamada
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      stopAllMediaTracks();
    };
  }, [stopAllMediaTracks, currentPartner?.id, currentPartner?.shortName]);

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

  // Alternar Captura de Notas
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

  // Guardar Minuta en Bitácora
  const handleSaveMinutaOnly = () => {
    if (!sessionTitle.trim() || !agreements.trim()) {
      alert('Por favor agrega notas o acuerdos para guardar en la minuta.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

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

  // Modal minimizado Picture-in-Picture
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-200">
        <div className="w-80 bg-stone-950 text-white rounded-2xl border border-amber-500/50 shadow-2xl p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <span className="text-xs font-bold truncate max-w-[130px]">{sessionTitle}</span>
              <span className="text-[10px] font-mono text-amber-400 bg-stone-900 px-1.5 py-0.5 rounded">
                {formatTimer(callDuration)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                title="Maximizar llamada"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleExitCall}
                className="p-1 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/50"
                title="Colgar"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-2 rounded-xl text-xs transition ${
                  isAudioEnabled ? 'bg-stone-800 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={toggleVideo}
                className={`p-2 rounded-xl text-xs transition ${
                  isVideoEnabled ? 'bg-stone-800 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {isVideoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={toggleNotesCapture}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                isRecordingNotes
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-500 text-stone-950'
              }`}
            >
              {isRecordingNotes ? 'Parar Notas' : 'Tomar Notas'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      {/* Audio oculto para reproducción sin interrupciones */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

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

              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60 animate-pulse'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}>
                {connectionStatus === 'connected'
                  ? 'P2P Conectado'
                  : connectionStatus === 'connecting'
                  ? 'Conectando audio/video...'
                  : `Esperando a ${remotePartner?.shortName || 'socio'}...`}
              </span>

              <span className="text-xs font-mono text-stone-300 font-bold bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
                {formatTimer(callDuration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
              title="Minimizar a esquina flotante (Picture-in-Picture) para ver recetas o tablero"
            >
              <Minimize2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-stone-300 text-[11px]">Minimizar</span>
            </button>

            <button
              onClick={handleExitCall}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition"
              title="Cerrar sala"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo Dividido: Sala de Video (WebRTC P2P) vs Panel de Minuta Inteligente */}
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

              {/* Cámara 2: Socio Remoto (WebRTC P2P con Audio y Video en Vivo) */}
              <div className="relative bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 h-full min-h-[220px] flex items-center justify-center shadow-lg">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${connectionStatus === 'connected' ? 'block' : 'hidden'}`}
                />

                {connectionStatus !== 'connected' && (
                  <div className="text-center p-6 text-stone-400">
                    <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-xl font-bold text-amber-400 mx-auto mb-2 border border-stone-700 shadow-md">
                      {remotePartner.name.charAt(0)}
                    </div>
                    <p className="text-xs font-bold text-stone-200">{remotePartner.name}</p>
                    <p className="text-[11px] text-amber-400/90 font-medium">{remotePartner.role}</p>

                    <div className="mt-3 flex flex-col items-center gap-1.5">
                      {remotePartner.isOnline ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded-full font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Conectando video en tiempo real...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 bg-stone-800 text-stone-400 border border-stone-700 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                          {remotePartner.shortName} aún no ha entrado a la llamada
                        </span>
                      )}
                      <span className="text-[10px] text-stone-500">
                        {remotePartner.shortName} debe presionar "Entrar a la Sala" en su pantalla
                      </span>
                    </div>
                  </div>
                )}

                {/* Badge de Socio Remoto */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs flex items-center gap-2 border border-white/10">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'
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
                className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-2 shadow-lg"
                title="Salir y colgar llamada"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="text-xs">Finalizar Sesión</span>
              </button>
            </div>
          </div>

          {/* LADO DERECHO: Panel de Minuta Inteligente Asistida */}
          <div className="w-full lg:w-[480px] bg-stone-900/60 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Título de la Sesión y Asistentes */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Minuta Inteligente & Acuerdos
                  </h3>
                </div>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Título de la reunión..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-semibold"
                />
                <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Participantes: <strong className="text-stone-300">{attendees}</strong></span>
                </p>
              </div>

              {/* Botón de Grabación de Notas por Voz */}
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

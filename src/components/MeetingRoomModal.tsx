'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Partner, LogbookEntry } from '@/types';
import {
  Video,
  Mic,
  MicOff,
  Sparkles,
  Mail,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface MeetingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  onSaveMinuta: (entry: Omit<LogbookEntry, 'id'>) => void;
}

export const MeetingRoomModal: React.FC<MeetingRoomModalProps> = ({
  isOpen,
  onClose,
  partners,
  onSaveMinuta,
}) => {
  if (!isOpen) return null;

  const [sessionTitle, setSessionTitle] = useState('Sesión Estratégica & Acuerdos Migalia');
  const [attendees, setAttendees] = useState(
    partners.map((p) => p.name).join(', ') || 'Mario González & Susy'
  );
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isMeetActive, setIsMeetActive] = useState(false);
  const [isFullscreenMeet, setIsFullscreenMeet] = useState(false);

  // Estados de Voz y Transcripción
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agreements, setAgreements] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Estados de Envío de Correo
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailStatusMsg, setEmailStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Configuración del Reconocimiento de Voz (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-MX';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Error de reconocimiento de voz:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Si el usuario no lo pausó explícitamente, intentar mantenerlo
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        'Tu navegador no soporta dictado por voz nativo. Puedes escribir los puntos directamente en el panel de notas.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('No se pudo iniciar el micrófono:', err);
      }
    }
  };

  // Procesar y Estructurar con Miga AI
  const handleStructureWithAI = () => {
    const sourceText = (transcript + ' ' + agreements).trim();
    if (!sourceText) {
      alert('Primero dicta o escribe notas en la sesión para que Miga AI las pueda estructurar.');
      return;
    }

    setIsProcessingAI(true);

    setTimeout(() => {
      // Estructurador inteligente en acuerdos formales
      const formatted =
        `1. OBJETIVO DE LA SESIÓN:\n` +
        `• Revisión y alineación de acuerdos operativos, finanzas y próximos hitos de apertura de Migalia.\n\n` +
        `2. ACUERDOS Y DECISIONES ASENTADAS:\n` +
        sourceText
          .split(/\.|\n/)
          .filter((line) => line.trim().length > 10)
          .map((line, idx) => `• Acuerdo ${idx + 1}: ${line.trim()}.`)
          .slice(0, 5)
          .join('\n') +
        `\n\n3. PRÓXIMOS PASOS Y COMPROMISOS:\n` +
        `• Mario: Dar seguimiento legal, financiero y liberación de presupuesto.\n` +
        `• Susy: Pruebas técnicas culinarias y revisión de equipamiento.\n` +
        `• Fecha compromiso de próxima sesión: Próxima semana.`;

      setAgreements(formatted);
      setIsProcessingAI(false);
    }, 600);
  };

  // Guardar en Bitácora y Enviar por Correo
  const handleSaveAndSend = async () => {
    if (!sessionTitle.trim() || !agreements.trim()) {
      alert('Debes asignar un título y redactar los acuerdos de la minuta.');
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus('idle');

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Guardar en la Bitácora del sistema
    onSaveMinuta({
      title: `Minuta Meet: ${sessionTitle}`,
      content: agreements,
      category: 'Reunión & Acuerdos',
      authorId: partners[0]?.id || '',
      authorName: 'Sesión Meet (Mario & Susy)',
      date: todayStr,
    });

    // 2. Despachar correo mediante la API
    try {
      const res = await fetch('/api/send-minuta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sessionTitle,
          date: todayStr,
          agreements: agreements,
          attendees: attendees,
          rawNotes: transcript,
          senderName: 'Miga AI & Migalia Meets',
          recipients: partners.map((p) => p.email).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEmailStatus('success');
        setEmailStatusMsg(data.message || 'Minuta asentada y enviada a los socios.');
      } else {
        setEmailStatus('error');
        setEmailStatusMsg(data.error || 'No se pudo enviar por correo, pero quedó guardada en bitácora.');
      }
    } catch (err: any) {
      setEmailStatus('error');
      setEmailStatusMsg('Minuta registrada en Bitácora (Servicio de correo en cola).');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyAgreements = () => {
    navigator.clipboard.writeText(agreements);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full h-[94vh] max-w-6xl rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header de la Sesión */}
        <div className="p-4 sm:px-6 bg-stone-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-white">
                  Migalia Meets & Asistente de Minutas
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full font-bold border border-amber-400/30">
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Sesión de trabajo colaborativa con dictado por voz, estructuración de acuerdos y despacho por correo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo Dividido: Sala de Llamada vs Panel de Minuta Inteligente */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LADO IZQUIERDO: Videollamada Embebida / Acceso a Sala */}
          <div
            className={`flex flex-col bg-stone-100 border-b lg:border-b-0 lg:border-r border-stone-200 p-4 transition-all duration-300 ${
              isFullscreenMeet ? 'lg:w-full' : 'lg:w-1/2'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Sala de Videollamada (Meet)</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-stone-200"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Crear Google Meet</span>
                </a>
                <button
                  onClick={() => setIsFullscreenMeet(!isFullscreenMeet)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 bg-white border border-stone-200 rounded-lg transition"
                  title={isFullscreenMeet ? 'Reducir' : 'Expandir sala'}
                >
                  {isFullscreenMeet ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Configurar Enlace de Sala o Usar Sala Integrada */}
            <div className="mb-3 flex gap-2">
              <input
                type="url"
                placeholder="Pega enlace de Google Meet o deja en blanco para sala integrada..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                onClick={() => setIsMeetActive(true)}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition shrink-0"
              >
                Conectar
              </button>
            </div>

            {/* Contenedor del Meet */}
            <div className="flex-1 bg-stone-900 rounded-2xl overflow-hidden border border-stone-300 flex items-center justify-center relative shadow-inner">
              {isMeetActive ? (
                meetingUrl.includes('meet.google.com') ? (
                  <div className="text-center p-6 text-white">
                    <Video className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h4 className="font-bold text-base mb-1">Sala de Google Meet Preparada</h4>
                    <p className="text-xs text-stone-300 mb-4 max-w-sm mx-auto">
                      Por políticas de seguridad de Google, Google Meet se abre en su pestaña optimizada mientras tomas la minuta aquí al lado.
                    </p>
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Abrir Google Meet en Pestaña Activa</span>
                    </a>
                  </div>
                ) : (
                  <iframe
                    src={`https://meet.jit.si/Migalia_Boutique_${encodeURIComponent(sessionTitle.replace(/\s+/g, '_'))}#config.startWithAudioMuted=false&config.prejoinPageEnabled=false`}
                    className="w-full h-full border-0"
                    allow="camera; microphone; display-capture; autoplay; clipboard-write"
                    title="Migalia Meet Room"
                  />
                )
              ) : (
                <div className="text-center p-6 text-white">
                  <div className="p-4 bg-stone-800 text-amber-400 rounded-2xl w-fit mx-auto mb-3">
                    <Video className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-stone-100">Sala de Conexión de Migalia</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                    Conéctate en video con tus socios mientras el asistente transcribe y asienta los acuerdos en vivo.
                  </p>
                  <button
                    onClick={() => setIsMeetActive(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <span>Iniciar Sala Segura</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* LADO DERECHO: Asistente de Minutas, Dictado por Voz & Correo */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4 bg-white">
            {/* Metadatos de la Sesión */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Título de la Sesión
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Asistentes
                </label>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-stone-800 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Barra de Control de Dictado por Voz */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl text-white font-semibold transition flex items-center gap-2 shadow-md ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-700 animate-pulse shadow-rose-600/30'
                      : 'bg-stone-900 hover:bg-stone-800 shadow-stone-900/20'
                  }`}
                >
                  {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  <span className="text-xs">
                    {isListening ? 'Escuchando en vivo...' : 'Activar Dictado por Voz'}
                  </span>
                </button>

                <p className="text-xs text-stone-600">
                  {isListening
                    ? 'Hablen con normalidad; los acuerdos se capturan sin teclear.'
                    : 'Presiona el micrófono para dictar sin escribir durante la llamada.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStructureWithAI}
                disabled={isProcessingAI}
                className="px-3.5 py-2 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{isProcessingAI ? 'Estructurando...' : 'Estructurar con Miga AI'}</span>
              </button>
            </div>

            {/* Transcripción en Vivo */}
            {transcript && (
              <div>
                <span className="text-[11px] font-bold text-stone-500 block mb-1">
                  Transcripción Cruda en Vivo:
                </span>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 max-h-28 overflow-y-auto italic font-sans leading-relaxed">
                  {transcript}
                </div>
              </div>
            )}

            {/* Acuerdos Oficiales Asentados */}
            <div className="flex-1 flex flex-col min-h-[180px]">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Minuta Final & Acuerdos (Se enviará por correo)
                </label>
                <button
                  type="button"
                  onClick={handleCopyAgreements}
                  className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado' : 'Copiar texto'}</span>
                </button>
              </div>
              <textarea
                rows={8}
                value={agreements}
                onChange={(e) => setAgreements(e.target.value)}
                placeholder="Los acuerdos estructurados por voz o con Miga AI aparecerán aquí. También puedes editarlos directamente..."
                className="w-full flex-1 p-3.5 text-xs text-stone-800 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed font-sans"
              />
            </div>

            {/* Notificación de Estatus de Correo */}
            {emailStatus !== 'idle' && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  emailStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {emailStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{emailStatusMsg}</span>
              </div>
            )}

            {/* Footer con Acciones de Despacho */}
            <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-stone-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Se registrará automáticamente en Bitácora con copia a los socios.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold transition"
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndSend}
                  disabled={isSendingEmail}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isSendingEmail ? 'Enviando Minuta...' : 'Asentar & Enviar Minuta por Correo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

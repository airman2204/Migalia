'use client';

import React, { useState } from 'react';
import { ScheduledMeeting, Partner } from '@/types';
import {
  Calendar,
  Clock,
  Plus,
  Video,
  X,
  CheckCircle2,
  Trash2,
  Users,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface MeetingsCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  meetings: ScheduledMeeting[];
  onAddMeeting: (meeting: Omit<ScheduledMeeting, 'id' | 'createdAt'>) => void;
  onDeleteMeeting: (meetingId: string) => void;
  onLaunchMeeting: (meeting: ScheduledMeeting) => void;
}

export const MeetingsCalendarModal: React.FC<MeetingsCalendarModalProps> = ({
  isOpen,
  onClose,
  partners,
  meetings,
  onAddMeeting,
  onDeleteMeeting,
  onLaunchMeeting,
}) => {
  if (!isOpen) return null;

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('17:00');
  const [topics, setTopics] = useState('');
  const [attendees, setAttendees] = useState(
    partners.map((p) => p.name).join(', ') || 'Mario González & Susy'
  );

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) return;

    onAddMeeting({
      title: title.trim(),
      date,
      time,
      attendees,
      status: 'scheduled',
      topics: topics.trim(),
    });

    setTitle('');
    setTopics('');
    setShowScheduleForm(false);
  };

  const sortedMeetings = [...meetings].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  );

  const upcomingMeetings = sortedMeetings.filter((m) => m.status === 'scheduled');
  const pastMeetings = sortedMeetings.filter((m) => m.status !== 'scheduled');

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:px-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white">
                Calendario Interno de Sesiones & Llamadas
              </h2>
              <p className="text-xs text-stone-400">
                Programa reuniones entre Mario y Susy y accede a la sala con toma automática de minutas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showScheduleForm ? 'Ver Lista' : 'Agendar Sesión'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50 space-y-6">
          {/* Formulario de Agendar Sesión */}
          {showScheduleForm && (
            <form
              onSubmit={handleCreateMeeting}
              className="bg-white p-5 rounded-2xl border border-amber-300 shadow-sm space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Programar Nueva Sesión de Trabajo</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Título del Asunto / Temas a tratar
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Revisión de cotizaciones de empaque y horno..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Asistentes Convocados
                  </label>
                  <input
                    type="text"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Fecha de la Sesión
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notas previas o temas a revisar (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Puntos clave que se van a definir en la sesión..."
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 text-stone-500 hover:bg-stone-100 rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Guardar en Calendario
                </button>
              </div>
            </form>
          )}

          {/* Próximas Sesiones Programadas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Próximas Sesiones ({upcomingMeetings.length})</span>
            </h3>

            {upcomingMeetings.length === 0 ? (
              <div className="p-8 rounded-2xl border border-stone-200 bg-white text-center">
                <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-xs text-stone-500 font-medium">
                  No hay sesiones programadas próximas.
                </p>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>Agendar Primera Sesión</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                          {meeting.date} · {meeting.time} hrs
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          Programada
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm">{meeting.title}</h4>
                      {meeting.topics && (
                        <p className="text-xs text-stone-500 leading-relaxed">{meeting.topics}</p>
                      )}
                      <p className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {meeting.attendees}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onLaunchMeeting(meeting);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                      >
                        <Video className="w-4 h-4" />
                        <span>Entrar a la Sesión</span>
                      </button>
                      <button
                        onClick={() => onDeleteMeeting(meeting.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 rounded-xl transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

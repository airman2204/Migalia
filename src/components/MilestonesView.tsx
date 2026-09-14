'use client';

import React, { useState } from 'react';
import { Milestone } from '@/types';
import { Calendar, Plus, Trash2, Edit3, CheckCircle2, Clock } from 'lucide-react';

interface MilestonesViewProps {
  milestones: Milestone[];
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  onUpdateMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({
  milestones,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState('Fase I: Planeación & Apertura');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Milestone['status']>('pending');
  const [progress, setProgress] = useState(0);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setPhase('Fase I: Planeación & Apertura');
    setDeadline(new Date().toISOString().split('T')[0]);
    setStatus('pending');
    setProgress(0);
    setShowModal(true);
  };

  const handleOpenEdit = (m: Milestone) => {
    setEditingId(m.id);
    setTitle(m.title);
    setPhase(m.phase);
    setDeadline(m.deadline);
    setStatus(m.status);
    setProgress(m.progress);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      onUpdateMilestone({
        id: editingId,
        title,
        phase,
        deadline,
        status,
        progress,
      });
    } else {
      onAddMilestone({
        title,
        phase,
        deadline,
        status,
        progress,
      });
    }
    setShowModal(false);
  };

  // Ordenar cronológicamente por deadline
  const sortedMilestones = [...milestones].sort((a, b) => (a.deadline > b.deadline ? 1 : -1));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#221F1D] tracking-tight">
            Cronograma Visual / Timeline de Apertura
          </h2>
          <p className="text-xs text-[#6E665D]">
            Línea temporal interactiva de hitos y metas clave para la apertura en Puebla.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] text-xs font-semibold px-4 py-2 rounded-xl shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Nuevo Hito</span>
        </button>
      </div>

      {/* Visual Horizontal/Vertical Timeline */}
      {sortedMilestones.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-dashed border-[#DDD5C7] rounded-3xl p-12 text-center">
          <Calendar className="w-8 h-8 text-[#A39E93] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#221F1D]">No hay hitos definidos todavía</p>
          <p className="text-[11px] text-[#6E665D] mt-1 max-w-sm mx-auto">
            Comienza agregando los grandes hitos de la apertura (ej. Trámites notariales, entrega del local, pruebas de horneado).
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-[#221F1D] text-[#F8F6F0] px-4 py-2 rounded-xl"
          >
            <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Crear Primer Hito</span>
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-1 before:bg-[#E6DFD5] before:rounded-full">
          {sortedMilestones.map((ms, index) => {
            const isCompleted = ms.status === 'completed';
            const inProgress = ms.status === 'in_progress';

            return (
              <div key={ms.id} className="relative group">
                {/* Timeline Node Point */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-3 w-7 h-7 rounded-full border-4 border-[#F8F6F0] flex items-center justify-center font-bold text-[10px] transition-all duration-200 ${
                    isCompleted
                      ? 'bg-[#4A6B53] text-[#FFFFFF]'
                      : inProgress
                      ? 'bg-[#C59B27] text-[#FFFFFF] ring-4 ring-[#C59B27]/20 scale-110'
                      : 'bg-[#DDD5C7] text-[#221F1D]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                </div>

                {/* Timeline Card */}
                <div className="bg-[#FFFFFF] border border-[#E6DFD5] hover:border-[#C59B27] rounded-2xl p-5 shadow-xs transition-all space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6239] bg-[#F2EFE9] px-2.5 py-0.5 rounded-full">
                          {ms.phase}
                        </span>
                        {inProgress && (
                          <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] px-2 py-0.5 rounded-full">
                            En Ejecución
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-bold bg-[#EDF3EE] text-[#4A6B53] border border-[#CDE0D1] px-2 py-0.5 rounded-full">
                            Cumplido
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[#221F1D]">
                        {ms.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-[#6E665D] bg-[#F8F6F0] px-3 py-1 rounded-xl border border-[#E6DFD5]">
                        <Clock className="w-3.5 h-3.5 text-[#C59B27]" />
                        <span className="font-semibold">{ms.deadline}</span>
                      </div>

                      <button
                        onClick={() => handleOpenEdit(ms)}
                        title="Editar Hito"
                        className="p-1.5 rounded-lg text-[#6E665D] hover:text-[#221F1D] hover:bg-[#F2EFE9]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('¿Deseas eliminar este hito del cronograma?')) {
                            onDeleteMilestone(ms.id);
                          }
                        }}
                        title="Eliminar Hito"
                        className="p-1.5 rounded-lg text-[#A39E93] hover:text-[#C84B31] hover:bg-[#FDF0ED]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progreso del Hito */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] text-[#6E665D]">
                      <span>Progreso de cumplimiento</span>
                      <span className="font-bold text-[#221F1D]">{ms.progress}%</span>
                    </div>
                    <div className="w-full bg-[#EBE7DF] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-[#4A6B53]' : 'bg-[#C59B27]'
                        }`}
                        style={{ width: `${ms.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Hito */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#221F1D]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl w-full max-w-md overflow-hidden shadow-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#221F1D]">
              {editingId ? 'Editar Hito del Cronograma' : 'Nuevo Hito en el Cronograma'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#221F1D] mb-1">
                  Nombre del Hito
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Entrega del local y colocación de chukum"
                  className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                  Fase del Proyecto
                </label>
                <input
                  type="text"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  placeholder="Ej. Fase I: Obra / Legal / Recetas"
                  className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                    Fecha Objetivo
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-2.5 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                    Estado
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-2.5 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Ejecución</option>
                    <option value="completed">Cumplido</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#221F1D] mb-1">
                  <span>Porcentaje de Avance</span>
                  <span>{progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-[#C59B27]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E6DFD5]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs px-3.5 py-2 text-[#6E665D] hover:text-[#221F1D]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-bold bg-[#221F1D] text-[#F8F6F0] px-4 py-2 rounded-xl hover:bg-[#34302C]"
                >
                  Guardar Hito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

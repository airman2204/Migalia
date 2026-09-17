'use client';

import React, { useState } from 'react';
import { Task, Partner, TaskCategory, Priority, TaskStatus } from '@/types';
import { X, CheckSquare, Plus, Trash2 } from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  onSaveTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const CATEGORIES: string[] = [
  'Legal & Permisos',
  'Finanzas',
  'Recetas & Menú',
  'Branding',
  'Comercial & Ventas',
  'Obra & Interiorismo',
  'Equipamiento',
  'Proveedores',
  'Operaciones',
  'Estrategia E-2',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  partners,
  onSaveTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || partners[0]?.id || '');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'Obra & Interiorismo');
  const [startDate, setStartDate] = useState(task?.startDate || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(task?.dueDate || new Date().toISOString().split('T')[0]);
  const [estimatedCost, setEstimatedCost] = useState<string>(
    task?.estimatedCost !== undefined ? String(task.estimatedCost) : ''
  );
  const [actualCost, setActualCost] = useState<string>(
    task?.actualCost !== undefined ? String(task.actualCost) : ''
  );
  const [isBlocked, setIsBlocked] = useState<boolean>(task?.isBlocked || false);
  const [blockerReason, setBlockerReason] = useState<string>(task?.blockerReason || '');
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Referencias para evitar que el polling de fondo resincronice el formulario mientras el usuario interactúa
  const activeTaskIdRef = React.useRef<string | undefined>(undefined);
  const prevIsOpenRef = React.useRef(false);

  React.useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    const taskChanged = task?.id !== activeTaskIdRef.current;

    if (isOpen && (justOpened || taskChanged)) {
      activeTaskIdRef.current = task?.id;
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setStatus(task?.status || 'todo');
      setPriority(task?.priority || 'medium');
      setAssignedTo(task?.assignedTo || partners[0]?.id || '');
      setCategory(task?.category || 'Obra & Interiorismo');
      setStartDate(task?.startDate || new Date().toISOString().split('T')[0]);
      setDueDate(task?.dueDate || new Date().toISOString().split('T')[0]);
      setEstimatedCost(task?.estimatedCost !== undefined ? String(task.estimatedCost) : '');
      setActualCost(task?.actualCost !== undefined ? String(task.actualCost) : '');
      setIsBlocked(task?.isBlocked || false);
      setBlockerReason(task?.blockerReason || '');
      setSubtasks(task?.subtasks ? task.subtasks.map((s) => ({ ...s })) : []);
      setNewSubtaskTitle('');
    }

    prevIsOpenRef.current = isOpen;
  }, [isOpen, task?.id]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: 'st-' + Date.now(), title: newSubtaskTitle, completed: false },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (stId: string) => {
    const updated = subtasks.map((st) =>
      st.id === stId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updated);
  };

  const handleToggleAllSubtasks = () => {
    const allAlreadyCompleted = subtasks.length > 0 && subtasks.every((s) => s.completed);
    const newCompleted = !allAlreadyCompleted;
    const updated = subtasks.map((s) => ({ ...s, completed: newCompleted }));
    setSubtasks(updated);
  };

  const handleDeleteSubtask = (stId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== stId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      id: task?.id || 'task-' + Date.now(),
      title,
      description,
      status,
      priority,
      assignedTo,
      category,
      startDate: startDate || undefined,
      dueDate,
      estimatedCost: estimatedCost && !isNaN(parseFloat(estimatedCost)) ? parseFloat(estimatedCost) : undefined,
      actualCost: actualCost && !isNaN(parseFloat(actualCost)) ? parseFloat(actualCost) : undefined,
      isBlocked,
      blockerReason: isBlocked ? blockerReason : undefined,
      subtasks,
      createdAt: task?.createdAt || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#221F1D]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFD5] bg-[#F8F6F0]">
          <h3 className="text-sm font-bold text-[#221F1D]">
            {task ? 'Detalle de Actividad' : 'Nueva Actividad'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6E665D] hover:bg-[#EBE7DF] hover:text-[#221F1D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-[#221F1D] mb-1">
              Título de la Actividad
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Comprar horno de convección 4 charolas digital"
              className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                Responsable
              </label>
              <div className="flex flex-wrap gap-1.5 p-1 bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl min-h-[36px] items-center">
                {partners.map((p) => {
                  const currentIds = assignedTo.split(',').map((s) => s.trim()).filter(Boolean);
                  const isSelected = currentIds.includes(p.id);

                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        let newIds: string[];
                        if (isSelected) {
                          newIds = currentIds.filter((id) => id !== p.id);
                        } else {
                          newIds = [...currentIds, p.id];
                        }
                        setAssignedTo(newIds.join(','));
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#221F1D] text-[#F8F6F0] shadow-2xs font-semibold'
                          : 'bg-[#FFFFFF] text-[#6E665D] hover:bg-[#EBE7DF] border border-[#E6DFD5]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#C59B27]' : 'bg-[#DDD5C7]'}`} />
                      <span>{p.shortName || p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-2.5 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-2.5 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              >
                <option value="backlog">Ideas</option>
                <option value="todo">Por Hacer</option>
                <option value="in_progress">En Proceso</option>
                <option value="review">En Revisión</option>
                <option value="done">Terminado</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-2.5 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] mb-1">
                Fecha Límite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-2.5 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              />
            </div>
          </div>

          {/* Sección Financiera CAPEX */}
          <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 rounded-2xl space-y-2">
            <p className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider flex items-center gap-1.5">
              <span>💰 Presupuesto & Costo (MXN)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-[#6E665D] mb-1">
                  Costo Estimado (Cotización)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-[#A39E93]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl pl-6 pr-2.5 py-1.5 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#6E665D] mb-1">
                  Costo Real Pagado
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-[#A39E93]">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0.00"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl pl-6 pr-2.5 py-1.5 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Marcador de Bloqueador / Dependencia Crítica */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            isBlocked ? 'bg-[#FFF7ED] border-[#FDBA74]' : 'bg-[#FAF8F5] border-[#E6DFD5]'
          }`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBlocked}
                onChange={(e) => setIsBlocked(e.target.checked)}
                className="rounded text-[#EA580C] focus:ring-0 w-4 h-4"
              />
              <span className={`text-xs font-bold ${isBlocked ? 'text-[#EA580C]' : 'text-[#221F1D]'}`}>
                ⚠️ Actividad bloqueada por un tercero o proveedor externo
              </span>
            </label>

            {isBlocked && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  placeholder="¿Cuál es el cuello de botella? (Ej. Esperando transformador de CFE)"
                  className="w-full text-xs bg-[#FFFFFF] border border-[#FDBA74] rounded-xl px-3 py-1.5 text-[#221F1D] placeholder-[#A39E93] focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#221F1D] mb-1">
              Descripción y Notas
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre proveedores, especificaciones técnicas o costos..."
              className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
            />
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#221F1D]">
                Checklist de Subtareas ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
              </label>
              {subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleAllSubtasks}
                  className="text-[10px] font-bold text-[#8C6239] hover:text-[#C59B27] underline decoration-dotted"
                >
                  {subtasks.every((s) => s.completed) ? 'Desmarcar todo' : 'Marcar todo como completado'}
                </button>
              )}
            </div>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between bg-[#F8F6F0] px-3 py-1.5 rounded-lg text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded text-[#C59B27] focus:ring-0"
                    />
                    <span className={st.completed ? 'line-through text-[#A39E93]' : 'text-[#221F1D]'}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="text-[#A39E93] hover:text-[#C84B31] p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Añadir paso a la checklist..."
                className="flex-1 text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg px-3 py-1.5 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="bg-[#221F1D] text-[#F8F6F0] px-3 py-1.5 rounded-lg text-xs hover:bg-[#34302C]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E6DFD5]">
            {task && onDeleteTask ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Eliminar esta actividad?')) {
                    onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="text-xs text-[#C84B31] hover:underline font-semibold"
              >
                Eliminar Actividad
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs px-3.5 py-2 text-[#6E665D] hover:text-[#221F1D]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="text-xs font-bold bg-[#221F1D] text-[#F8F6F0] px-5 py-2 rounded-xl hover:bg-[#34302C] shadow-xs"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

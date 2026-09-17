'use client';

import React, { useState } from 'react';
import { Task, Partner, TaskStatus, Priority } from '@/types';
import { Search, Filter, Clock, CheckSquare, Plus, ArrowRight, AlertOctagon } from 'lucide-react';
import { analyzeTaskDate, getOverdueMetrics } from '@/lib/taskImpactUtils';

interface TasksListViewProps {
  tasks: Task[];
  partners: Partner[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onGoToKanban?: () => void;
}

export const TasksListView: React.FC<TasksListViewProps> = ({
  tasks,
  partners,
  onSelectTask,
  onOpenNewTask,
  onStatusChange,
  onGoToKanban,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [onlyOverdueFilter, setOnlyOverdueFilter] = useState(false);
  const overdueMetrics = getOverdueMetrics(tasks);

  const getPartner = (id: string) => partners.find((p) => p.id === id);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesOverdue = !onlyOverdueFilter || analyzeTaskDate(t).status === 'overdue';
    return matchesSearch && matchesCategory && matchesOverdue;
  });

  // Código de color exacto solicitado:
  // - Alta: ROJO (#DC2626)
  // - Urgente: NARANJA (#EA580C)
  // - Media: AMARILLA (#CA8A04)
  // - Baja: VERDE (#16A34A)
  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FDF0ED] text-[#DC2626] border border-[#FECACA]">
            Alta
          </span>
        );
      case 'urgent':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]">
            Urgente
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A]">
            Media
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
            Baja
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#221F1D] tracking-tight">
            Lista de Actividades de Apertura
          </h2>
          <p className="text-xs text-[#6E665D]">
            Crea y planifica tus actividades aquí; se sincronizan automáticamente con el Tablero Kanban y la base de datos.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onGoToKanban && (
            <button
              onClick={onGoToKanban}
              className="flex items-center gap-1.5 bg-[#FFFFFF] hover:bg-[#F8F6F0] text-[#8C6239] text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#E6DFD5] shadow-xs"
            >
              <span>Ver en Kanban</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C59B27]" />
            </button>
          )}

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] text-xs font-semibold px-4 py-2 rounded-xl shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Nueva Actividad</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#A39E93]" />
          <input
            type="text"
            placeholder="Buscar por palabra clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent text-[#221F1D] placeholder-[#A39E93] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {overdueMetrics.overdueCount > 0 && (
            <button
              onClick={() => setOnlyOverdueFilter(!onlyOverdueFilter)}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                onlyOverdueFilter
                  ? 'bg-red-600 text-white border-red-700'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Vencidas ({overdueMetrics.overdueCount})</span>
            </button>
          )}

          <Filter className="w-3.5 h-3.5 text-[#8C6239]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg px-2.5 py-1 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
          >
            <option value="all">Todos los frentes</option>
            <option value="Obra & Interiorismo">Obra & Interiorismo</option>
            <option value="Equipamiento">Equipamiento</option>
            <option value="Legal & S.A.">Legal & S.A.</option>
            <option value="Recetas & Pruebas">Recetas & Pruebas</option>
            <option value="Empaque & Marca">Empaque & Marca</option>
            <option value="Estrategia E-2">Estrategia E-2</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] border-b border-[#E6DFD5] text-[#6E665D] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">Actividad</th>
                <th className="px-3 py-3">Frente</th>
                <th className="px-3 py-3">Responsable</th>
                <th className="px-3 py-3">Prioridad</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Costo Real / Estimado</th>
                <th className="px-3 py-3">Fecha Límite</th>
                <th className="px-3 py-3 text-right">Subtareas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-[#A39E93]">
                    No hay actividades registradas en esta vista. Haz clic en <strong>+ Nueva Actividad</strong> para agregar la primera.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const partner = getPartner(t.assignedTo);
                  const doneCount = (t.subtasks || []).filter((s) => s.completed).length;
                  const dateAnalysis = analyzeTaskDate(t);
                  const isOverdue = dateAnalysis.status === 'overdue';

                  return (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`cursor-pointer transition-colors ${
                        isOverdue
                          ? 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-l-red-500'
                          : t.isBlocked
                          ? 'bg-[#FFFBF5] hover:bg-[#FAF8F5]'
                          : 'hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-center gap-2">
                          {isOverdue && (
                            <span className="shrink-0 text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                              ATRASADA
                            </span>
                          )}
                          {t.isBlocked && (
                            <span
                              title={`Bloqueada: ${t.blockerReason || 'Por proveedor/tercero'}`}
                              className="shrink-0 text-[10px] font-bold bg-[#FFEDD5] text-[#EA580C] border border-[#FED7AA] px-1.5 py-0.5 rounded"
                            >
                              ⚠️ Bloqueada
                            </span>
                          )}
                          <span className="font-semibold text-[#221F1D] truncate">
                            {t.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#8C6239] font-medium">
                        {t.category}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.assignedTo ? (
                            t.assignedTo.split(',').map((id) => {
                              const p = getPartner(id.trim());
                              return (
                                <span
                                  key={id}
                                  className="bg-[#F2EFE9] border border-[#DDD5C7] px-2 py-0.5 rounded-full text-[10px] font-medium text-[#221F1D]"
                                >
                                  {p?.shortName || p?.name || id}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[#A39E93] text-[10px]">Sin asignar</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">{getPriorityBadge(t.priority)}</td>
                      <td className="px-3 py-3">
                        <select
                          value={t.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onStatusChange(t.id, e.target.value as TaskStatus)}
                          className="text-[11px] bg-[#F8F6F0] border border-[#E6DFD5] rounded-md px-2 py-0.5 text-[#221F1D] focus:outline-none"
                        >
                          <option value="backlog">Ideas</option>
                          <option value="todo">Por Hacer</option>
                          <option value="in_progress">En Proceso</option>
                          <option value="review">Revisión</option>
                          <option value="done">Terminado</option>
                        </select>
                      </td>
                      <td className="px-3 py-3 text-[11px]">
                        {t.actualCost !== undefined ? (
                          <span className="font-bold text-[#221F1D]">
                            ${t.actualCost.toLocaleString('es-MX')}
                          </span>
                        ) : t.estimatedCost !== undefined ? (
                          <span className="text-[#8C6239]">
                            ~${t.estimatedCost.toLocaleString('es-MX')}
                          </span>
                        ) : (
                          <span className="text-[#A39E93]">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border ${dateAnalysis.badgeClass}`}>
                            {dateAnalysis.badgeLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-[#6E665D] font-medium">
                        {(t.subtasks || []).length > 0 ? `${doneCount}/${(t.subtasks || []).length}` : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

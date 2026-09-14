'use client';

import React, { useState } from 'react';
import { Task, Partner, TaskStatus, Priority } from '@/types';
import { Search, Filter, Clock, CheckSquare, Plus, Trash2 } from 'lucide-react';

interface TasksListViewProps {
  tasks: Task[];
  partners: Partner[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TasksListView: React.FC<TasksListViewProps> = ({
  tasks,
  partners,
  onSelectTask,
  onOpenNewTask,
  onStatusChange,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getPartner = (id: string) => partners.find((p) => p.id === id);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'backlog': return 'Ideas';
      case 'todo': return 'Por Hacer';
      case 'in_progress': return 'En Proceso';
      case 'review': return 'Revisión';
      case 'done': return 'Terminado';
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FDF0ED] text-[#C84B31]">Urgente</span>;
      case 'high': return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#D97706]">Alta</span>;
      case 'medium': return <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F2EFE9] text-[#6E665D]">Media</span>;
      default: return <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-[#F8F6F0] text-[#A39E93]">Baja</span>;
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
            Desglose tabular completo de tareas por frente de trabajo.
          </p>
        </div>

        <button
          onClick={onOpenNewTask}
          className="flex items-center gap-1.5 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] text-xs font-semibold px-4 py-2 rounded-xl shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Nueva Tarea</span>
        </button>
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
                <th className="px-3 py-3">Fecha Límite</th>
                <th className="px-3 py-3 text-right">Subtareas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]">
              {filteredTasks.map((t) => {
                const partner = getPartner(t.assignedTo);
                const doneCount = t.subtasks.filter((s) => s.completed).length;

                return (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className="hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-[#221F1D] max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="px-3 py-3 text-[#8C6239] font-medium">
                      {t.category}
                    </td>
                    <td className="px-3 py-3">
                      <span className="bg-[#F2EFE9] border border-[#DDD5C7] px-2 py-0.5 rounded-full text-[10px] font-medium text-[#221F1D]">
                        {partner?.shortName || 'Sin asignar'}
                      </span>
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
                    <td className="px-3 py-3 text-[#6E665D]">
                      {t.dueDate}
                    </td>
                    <td className="px-3 py-3 text-right text-[#6E665D] font-medium">
                      {t.subtasks.length > 0 ? `${doneCount}/${t.subtasks.length}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

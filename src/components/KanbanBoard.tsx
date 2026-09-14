'use client';

import React from 'react';
import { Task, Partner, TaskStatus } from '@/types';
import { Clock, CheckSquare, AlertCircle, User } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  partners: Partner[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: 'backlog', label: 'Ideas & Por Definir', dotColor: 'bg-[#A39E93]' },
  { id: 'todo', label: 'Por Hacer', dotColor: 'bg-[#8C6239]' },
  { id: 'in_progress', label: 'En Proceso', dotColor: 'bg-[#C59B27]' },
  { id: 'review', label: 'En Revisión', dotColor: 'bg-[#9C4146]' },
  { id: 'done', label: 'Completado', dotColor: 'bg-[#4A6B53]' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  partners,
  onStatusChange,
  onSelectTask,
}) => {
  const getPartner = (id: string) => partners.find((p) => p.id === id);

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FDF0ED] text-[#C84B31] border border-[#F5C6BC]">Urgente</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">Alta</span>;
      case 'medium':
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F2EFE9] text-[#6E665D] border border-[#DDD5C7]">Media</span>;
      default:
        return <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-[#F8F6F0] text-[#A39E93]">Baja</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-[#F2EFE9]/60 border border-[#E6DFD5] rounded-2xl p-3 min-w-[260px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                <h3 className="text-xs font-bold text-[#221F1D] tracking-wide">
                  {col.label}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#6E665D] bg-[#E6DFD5] px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1">
              {colTasks.map((task) => {
                const partner = getPartner(task.assignedTo);
                const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="bg-[#FFFFFF] border border-[#E6DFD5] hover:border-[#C59B27] p-3.5 rounded-xl shadow-xs cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                  >
                    {/* Category & Priority */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-semibold text-[#8C6239] uppercase tracking-wider truncate max-w-[130px]">
                        {task.category}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-semibold text-[#221F1D] leading-snug mb-2 line-clamp-2">
                      {task.title}
                    </h4>

                    {/* Subtasks Progress if any */}
                    {task.subtasks.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6E665D] mb-2.5 bg-[#F8F6F0] px-2 py-1 rounded-md">
                        <CheckSquare className="w-3 h-3 text-[#8C6239]" />
                        <span>
                          {completedSubtasks}/{task.subtasks.length} subtareas
                        </span>
                      </div>
                    )}

                    {/* Footer: Due date & Assigned Partner */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F2EFE9] text-[11px]">
                      <div className="flex items-center gap-1 text-[#6E665D]">
                        <Clock className="w-3 h-3 text-[#A39E93]" />
                        <span>{task.dueDate.substring(5)}</span>
                      </div>

                      {partner && (
                        <div
                          title={`${partner.name} (${partner.role})`}
                          className="flex items-center gap-1 bg-[#F2EFE9] border border-[#DDD5C7] px-2 py-0.5 rounded-full text-[10px] font-medium text-[#221F1D]"
                        >
                          <User className="w-2.5 h-2.5 text-[#8C6239]" />
                          <span>{partner.shortName}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Move Select for instant feedback */}
                    <div className="mt-2.5 pt-2 border-t border-[#F8F6F0] flex justify-end">
                      <select
                        value={task.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        className="text-[10px] bg-[#F8F6F0] text-[#6E665D] border border-[#E6DFD5] rounded-md px-1.5 py-0.5 focus:outline-none focus:border-[#C59B27]"
                      >
                        <option value="backlog">Mover a: Ideas</option>
                        <option value="todo">Mover a: Por Hacer</option>
                        <option value="in_progress">Mover a: En Proceso</option>
                        <option value="review">Mover a: Revisión</option>
                        <option value="done">Mover a: Terminado</option>
                      </select>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="h-24 border border-dashed border-[#DDD5C7] rounded-xl flex items-center justify-center text-[11px] text-[#A39E93]">
                  Sin pendientes
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

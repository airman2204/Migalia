'use client';

import React from 'react';
import { Task, Partner, TaskStatus } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, CheckSquare, User, GripVertical, Plus } from 'lucide-react';

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

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as TaskStatus;
    onStatusChange(draggableId, newStatus);
  };

  // Código de color exacto solicitado:
  // - Alta: ROJO (#C84B31)
  // - Urgente: NARANJA (#EA580C)
  // - Media: AMARILLA (#CA8A04)
  // - Baja: VERDE (#16A34A)
  const getPriorityBadge = (priority: Task['priority']) => {
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col bg-[#F2EFE9]/70 border border-[#E6DFD5] rounded-2xl p-3 min-w-[260px] min-h-[480px]"
            >
              {/* Encabezado de Columna */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-xs font-bold text-[#221F1D] tracking-wide">
                    {col.label}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#6E665D] bg-[#E6DFD5] px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Zona Droppable */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 flex-1 transition-colors rounded-xl p-1 ${
                      snapshot.isDraggingOver ? 'bg-[#EBE7DF]/60 border border-dashed border-[#C59B27]' : ''
                    }`}
                  >
                    {colTasks.map((task, index) => {
                      const partner = getPartner(task.assignedTo);
                      const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              onClick={() => onSelectTask(task)}
                              className={`bg-[#FFFFFF] border rounded-xl p-3.5 shadow-xs cursor-pointer transition-shadow ${
                                snapshot.isDragging
                                  ? 'border-[#C59B27] shadow-lg ring-2 ring-[#C59B27]/20 scale-102 rotate-1'
                                  : 'border-[#E6DFD5] hover:border-[#C59B27]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="text-[#A39E93] hover:text-[#221F1D] cursor-grab active:cursor-grabbing p-0.5"
                                    title="Arrastrar tarjeta"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[10px] font-semibold text-[#8C6239] uppercase tracking-wider truncate max-w-[120px]">
                                    {task.category}
                                  </span>
                                </div>
                                {getPriorityBadge(task.priority)}
                              </div>

                              <h4 className="text-xs font-semibold text-[#221F1D] leading-snug mb-2 line-clamp-2">
                                {task.title}
                              </h4>

                              {task.subtasks.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] text-[#6E665D] mb-2.5 bg-[#F8F6F0] px-2 py-1 rounded-md">
                                  <CheckSquare className="w-3 h-3 text-[#8C6239]" />
                                  <span>
                                    {completedSubtasks}/{task.subtasks.length} subtareas
                                  </span>
                                </div>
                              )}

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
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}

                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-28 border border-dashed border-[#DDD5C7] rounded-xl flex flex-col items-center justify-center text-[11px] text-[#A39E93] gap-1 p-3 text-center">
                        <span>Sin actividades</span>
                        <span className="text-[10px] text-[#C4BAAA]">Arrastra aquí o haz clic en +</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

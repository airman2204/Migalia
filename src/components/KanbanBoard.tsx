'use client';

import React, { useState } from 'react';
import { Task, Partner, TaskStatus } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, CheckSquare, User, GripVertical, Plus, AlertOctagon, Filter, ShieldAlert, ShoppingBag, FolderKanban, Sparkles } from 'lucide-react';
import { analyzeTaskDate, getOverdueMetrics } from '@/lib/taskImpactUtils';

interface KanbanBoardProps {
  tasks: Task[];
  partners: Partner[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
  initialMode?: 'tasks' | 'orders';
}

const TASK_COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: 'backlog', label: 'Ideas & Por Definir', dotColor: 'bg-[#A39E93]' },
  { id: 'todo', label: 'Por Hacer', dotColor: 'bg-[#8C6239]' },
  { id: 'in_progress', label: 'En Proceso', dotColor: 'bg-[#C59B27]' },
  { id: 'review', label: 'En Revisión', dotColor: 'bg-[#9C4146]' },
  { id: 'done', label: 'Completado', dotColor: 'bg-[#4A6B53]' },
];

const ORDER_COLUMNS: { id: TaskStatus; label: string; dotColor: string; description: string }[] = [
  { id: 'backlog', label: '1. Cotizaciones & Prospectos', dotColor: 'bg-stone-400', description: 'Inquietudes de Instagram sin anticipo' },
  { id: 'todo', label: '2. Anticipo Confirmado', dotColor: 'bg-amber-600', description: '50% pagado, por programar horneado' },
  { id: 'in_progress', label: '3. En Horno & Producción', dotColor: 'bg-orange-500', description: 'Elaboración de galletas y empaque' },
  { id: 'review', label: '4. Listo para Entrega / Envío', dotColor: 'bg-purple-600', description: 'Empacado en vitrina o ruta' },
  { id: 'done', label: '5. Entregado & Liquidado', dotColor: 'bg-emerald-600', description: 'Pedido concluido 100%' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  partners,
  onStatusChange,
  onSelectTask,
  initialMode = 'tasks',
}) => {
  const [boardMode, setBoardMode] = useState<'tasks' | 'orders'>(initialMode);
  const [filterOnlyOverdue, setFilterOnlyOverdue] = useState(false);

  // Separación estricta de tareas vs pedidos
  const isOrderTask = (t: Task) => {
    const cat = (t.category || '').toLowerCase();
    const title = (t.title || '').toLowerCase();
    return (
      cat.includes('pedido') ||
      cat.includes('evento') ||
      cat.includes('ventas') ||
      title.startsWith('pedido') ||
      title.startsWith('evento')
    );
  };

  const displayedList = tasks.filter((t) =>
    boardMode === 'orders' ? isOrderTask(t) : !isOrderTask(t)
  );

  const orderTasksCount = tasks.filter(isOrderTask).length;
  const standardTasksCount = tasks.filter((t) => !isOrderTask(t)).length;

  const currentColumns = boardMode === 'orders' ? ORDER_COLUMNS : TASK_COLUMNS;
  const overdueMetrics = getOverdueMetrics(displayedList);

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
    <div className="space-y-4">
      {/* Selector de Tablero: Actividades de Proyecto vs Tablero de Pedidos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E6DFD5] shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#F8F6F0] rounded-xl border border-[#E6DFD5]">
          <button
            onClick={() => setBoardMode('tasks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              boardMode === 'tasks'
                ? 'bg-[#221F1D] text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Actividades de Proyecto</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              boardMode === 'tasks' ? 'bg-stone-800 text-amber-300' : 'bg-stone-200 text-stone-600'
            }`}>
              {standardTasksCount}
            </span>
          </button>

          <button
            onClick={() => setBoardMode('orders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              boardMode === 'orders'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Tablero de Pedidos & Eventos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              boardMode === 'orders' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {orderTasksCount}
            </span>
          </button>
        </div>

        <div className="text-xs text-[#6E665D] flex items-center gap-2">
          {boardMode === 'orders' ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Flujo de Producción: Cotizado ➔ Horneado ➔ Entrega
            </span>
          ) : (
            <span className="text-stone-500">
              Flujo de Obra, Legal, Recetas & Equipamiento
            </span>
          )}
        </div>
      </div>

      {/* Banner de Impacto y Alerta de Fechas Límite */}
      {overdueMetrics.overdueCount > 0 ? (
        <div className="bg-gradient-to-r from-red-50 via-[#FFF7ED] to-amber-50 border border-red-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
                  {overdueMetrics.overdueCount} {boardMode === 'orders' ? 'Pedidos Demorados' : 'Actividades Vencidas'} · Alerta Crítica
                </h4>
                <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                  +{overdueMetrics.maxDaysOverdue}d de desvío máx.
                </span>
              </div>
              <p className="text-xs text-[#6E665D] mt-0.5">
                Monto en riesgo:{' '}
                <strong className="text-red-700">
                  ${overdueMetrics.totalFinancialImpact.toLocaleString('es-MX')} MXN
                </strong>
                . Requieren atención inmediata.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterOnlyOverdue(!filterOnlyOverdue)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-xs ${
              filterOnlyOverdue
                ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-300'
                : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {filterOnlyOverdue ? 'Ver todos' : 'Aislar solo Vencidos'}
          </button>
        </div>
      ) : (
        <div className="bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-4 py-2 text-xs text-[#6E665D] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {boardMode === 'orders' ? 'Producción de pedidos al día y en tiempo.' : 'Cronograma en tiempo: No hay actividades vencidas pendientes.'}
          </span>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
          {currentColumns.map((col) => {
            let colTasks = displayedList.filter((t) => t.status === col.id);
            if (filterOnlyOverdue) {
              colTasks = colTasks.filter((t) => analyzeTaskDate(t).status === 'overdue');
            }

            const colDesc = 'description' in col ? (col as any).description : null;

            return (
              <div
                key={col.id}
                className="flex flex-col bg-[#F2EFE9]/70 border border-[#E6DFD5] rounded-2xl p-3 min-w-[260px] min-h-[480px]"
              >
                {/* Encabezado de Columna */}
                <div className="mb-3 px-1">
                  <div className="flex items-center justify-between mb-1">
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
                  {colDesc && (
                    <p className="text-[10px] text-stone-500 leading-tight">
                      {colDesc}
                    </p>
                  )}
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
                      const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
                      const dateAnalysis = analyzeTaskDate(task);

                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              onClick={() => onSelectTask(task)}
                              className={`rounded-xl p-3.5 shadow-xs cursor-pointer transition-all ${
                                snapshot.isDragging
                                  ? 'border-[#C59B27] shadow-lg ring-2 ring-[#C59B27]/20 scale-102 rotate-1 bg-white'
                                  : `${dateAnalysis.cardBorderClass} bg-white hover:shadow-md`
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

                              <h4 className="text-xs font-semibold text-[#221F1D] leading-snug mb-1.5 line-clamp-2">
                                {task.title}
                              </h4>

                              {/* Alerta de Atraso Crítico */}
                              {dateAnalysis.status === 'overdue' && (
                                <div className="mb-2 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <AlertOctagon className="w-3 h-3 text-red-600" />
                                    {dateAnalysis.badgeLabel}
                                  </span>
                                  {dateAnalysis.financialImpact > 0 && (
                                    <span className="font-mono text-[9px] text-red-800">
                                      ${dateAnalysis.financialImpact.toLocaleString('es-MX')}
                                    </span>
                                  )}
                                </div>
                              )}

                              {task.isBlocked && (
                                <div className="mb-2 bg-[#FFEDD5] border border-[#FED7AA] text-[#EA580C] px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                                  <span>⚠️</span>
                                  <span className="truncate">{task.blockerReason || 'Bloqueada por tercero'}</span>
                                </div>
                              )}

                              {(task.subtasks || []).length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] text-[#6E665D] mb-2 bg-[#F8F6F0] px-2 py-1 rounded-md">
                                  <CheckSquare className="w-3 h-3 text-[#8C6239]" />
                                  <span>
                                    {completedSubtasks}/{(task.subtasks || []).length} subtareas
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t border-[#F2EFE9] text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-3 h-3 ${dateAnalysis.status === 'overdue' ? 'text-red-500' : 'text-[#A39E93]'}`} />
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${dateAnalysis.badgeClass}`}>
                                    {dateAnalysis.badgeLabel}
                                  </span>
                                  {task.actualCost !== undefined ? (
                                    <span className="font-bold text-[#221F1D] text-[10px]">
                                      ${task.actualCost.toLocaleString('es-MX')}
                                    </span>
                                  ) : task.estimatedCost !== undefined ? (
                                    <span className="text-[#8C6239] text-[10px]">
                                      ~${task.estimatedCost.toLocaleString('es-MX')}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {task.assignedTo &&
                                    task.assignedTo.split(',').map((id) => {
                                      const p = getPartner(id.trim());
                                      if (!p) return null;
                                      return (
                                        <div
                                          key={p.id}
                                          title={`${p.name} (${p.role})`}
                                          className="flex items-center gap-1 bg-[#F2EFE9] border border-[#DDD5C7] px-2 py-0.5 rounded-full text-[10px] font-medium text-[#221F1D]"
                                        >
                                          <User className="w-2.5 h-2.5 text-[#8C6239]" />
                                          <span>{p.shortName}</span>
                                        </div>
                                      );
                                    })}
                                </div>
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
    </div>
  );
};

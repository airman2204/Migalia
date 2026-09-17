'use client'

import React from 'react'
import { Task } from '../lib/mockData'
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react'

interface KanbanProps {
  tasks: Task[]
  onStatusChange: (taskId: string, newStatus: Task['status']) => void
}

export default function KanbanBoardView({ tasks, onStatusChange }: KanbanProps) {
  const columns: { status: Task['status']; title: string; color: string }[] = [
    { status: 'Por Hacer', title: 'Por Hacer', color: 'border-slate-300' },
    { status: 'En Progreso', title: 'En Progreso', color: 'border-amber-400' },
    { status: 'Bloqueado', title: 'Bloqueado / En Revisión', color: 'border-rose-400' },
    { status: 'Completado', title: 'Completado', color: 'border-emerald-500' },
  ]

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'Urgente':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
      case 'Alta':
        return 'bg-[#A07835]/15 text-[#A07835] border-[#A07835]/40 font-semibold'
      case 'Media':
        return 'bg-sky-100 text-sky-800 border-sky-200'
      default:
        return 'bg-[#F1EAE1] text-[#7A6658] border-[#E2D7CB]'
    }
  }

  const getCategoryBadge = (category: Task['category']) => {
    return 'bg-[#F1EAE1] text-[#2B1D19] border-[#E2D7CB]'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-[#2B1D19]">Tablero Kanban de Operaciones</h2>
        <span className="text-xs text-[#7A6658]">Tip: Haz clic en las flechas para mover las tarjetas de columna</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status)
          return (
            <div
              key={col.status}
              className="bg-[#F1EAE1]/50 p-4 rounded-2xl border border-[#E2D7CB] flex flex-col min-h-[450px]"
            >
              {/* Header Columna */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2D7CB]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2B1D19] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full bg-[#A07835]`} />
                  {col.title}
                </span>
                <span className="text-xs font-mono font-bold bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#E2D7CB] text-[#7A6658]">
                  {colTasks.length}
                </span>
              </div>

              {/* Lista de Tarjetas */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[#7A6658] border border-dashed border-[#E2D7CB] rounded-xl">
                    No hay tareas en esta sección
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2D7CB] shadow-sm hover:shadow-md hover:border-[#A07835] transition-all space-y-3 group"
                    >
                      {/* Categoría y Prioridad */}
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md border font-semibold ${getCategoryBadge(task.category)}`}>
                          {task.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Título */}
                      <h4 className="text-sm font-semibold text-[#2B1D19] leading-snug group-hover:text-[#A07835] transition-colors">
                        {task.title}
                      </h4>

                      {/* Subtareas Progress */}
                      {(task.subtasks || []).length > 0 && (
                        <div className="text-[11px] text-[#7A6658] bg-[#FAF6EF] p-2 rounded-lg border border-[#E2D7CB]/60">
                          <div className="flex justify-between mb-1 text-[10px]">
                            <span>Subtareas</span>
                            <span className="font-mono">
                              {(task.subtasks || []).filter((st) => st.completed).length}/{(task.subtasks || []).length}
                            </span>
                          </div>
                          <div className="w-full bg-[#E2D7CB] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#A07835] h-full"
                              style={{
                                width: `${((task.subtasks || []).filter((st) => st.completed).length / (task.subtasks || []).length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer Tarjeta */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F1EAE1]">
                        <div className="flex items-center gap-1 text-[11px] text-[#7A6658]">
                          <Clock className="w-3 h-3 text-[#A07835]" />
                          <span>{task.dueDate.split('-').slice(1).join('/')}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-[#2B1D19] bg-[#F1EAE1] px-2 py-0.5 rounded-md border border-[#E2D7CB]">
                            {task.assignee}
                          </span>

                          {/* Control rápido de mover estado */}
                          {col.status !== 'Completado' && (
                            <button
                              onClick={() => {
                                const nextStatus: Record<Task['status'], Task['status']> = {
                                  'Por Hacer': 'En Progreso',
                                  'En Progreso': 'Bloqueado',
                                  'Bloqueado': 'Completado',
                                  'Completado': 'Completado',
                                }
                                onStatusChange(task.id, nextStatus[task.status])
                              }}
                              className="p-1 text-[#7A6658] hover:text-[#A07835] hover:bg-[#F1EAE1] rounded-md transition-colors"
                              title="Avanzar Tarea"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

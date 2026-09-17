'use client'

import React, { useState } from 'react'
import { Task } from '../lib/mockData'
import { CheckSquare, Square, Search, Filter } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onToggleSubtask: (taskId: string, subtaskId: string) => void
}

export default function TaskListView({ tasks: initialTasks, onToggleSubtask }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('Todos')

  const filteredTasks = initialTasks.filter((t) => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAssignee = selectedAssignee === 'Todos' || t.assignee === selectedAssignee
    return matchesSearch && matchesAssignee
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2B1D19]">Tabla de Actividades & Subtareas</h2>
          <p className="text-xs text-[#7A6658]">Vista de lista con checklists de progreso interno por tarea</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#FFFFFF] p-3 rounded-2xl border border-[#E2D7CB] shadow-sm">
        <div className="flex items-center gap-2 bg-[#FAF6EF] px-3 py-2 rounded-xl border border-[#E2D7CB] flex-1 w-full">
          <Search className="w-4 h-4 text-[#7A6658]" />
          <input
            type="text"
            placeholder="Buscar por título o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-[#2B1D19] outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#7A6658] font-semibold">Responsable:</span>
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-[#F1EAE1] text-xs font-bold text-[#2B1D19] px-3 py-2 rounded-xl border border-[#E2D7CB] outline-none cursor-pointer"
          >
            <option value="Todos">Todos los socios</option>
            <option value="Socio A">Socio A</option>
            <option value="Socio B">Socio B</option>
          </select>
        </div>
      </div>

      {/* Lista de Tareas */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2D7CB] shadow-sm hover:border-[#A07835] transition-all space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1EAE1] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#F1EAE1] text-[#7A6658] border border-[#E2D7CB]">
                  {task.category}
                </span>
                <span className="text-xs font-semibold text-[#A07835]">
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#7A6658]">
                <span>Límite: <strong className="text-[#2B1D19] font-mono">{task.dueDate}</strong></span>
                <span className="px-2 py-0.5 bg-[#FAF6EF] rounded border border-[#E2D7CB] text-[#2B1D19] font-semibold">
                  {task.assignee}
                </span>
              </div>
            </div>

            <h3 className="font-serif font-bold text-base text-[#2B1D19]">{task.title}</h3>

            {/* Checklists anidados */}
            {task.subtasks.length > 0 && (
              <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E2D7CB]/60 space-y-2 mt-2">
                <span className="text-[11px] uppercase font-bold text-[#7A6658] block tracking-wider">
                  Checklist de Subtareas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {task.subtasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => onToggleSubtask(task.id, st.id)}
                      className="flex items-center gap-2 text-xs text-[#2B1D19] cursor-pointer hover:text-[#A07835] transition-colors p-1.5 rounded hover:bg-[#F1EAE1]"
                    >
                      {st.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#7A6658] shrink-0" />
                      )}
                      <span className={st.completed ? 'line-through text-[#7A6658]' : 'font-medium'}>
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

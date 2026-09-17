'use client';

import React, { useState, useMemo } from 'react';
import { Task, Milestone, Partner } from '@/types';
import { Layers } from 'lucide-react';

interface GanttViewProps {
  tasks: Task[];
  milestones: Milestone[];
  partners: Partner[];
  onSelectTask: (task: Task) => void;
}

export const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  milestones,
  partners,
  onSelectTask,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Calcular el rango de fechas para el diagrama
  const timelineDates = useMemo(() => {
    const dates: Date[] = [];
    const now = new Date();
    // Inicio: lunes de la semana pasada
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() - 7);

    // Fin: 10 semanas hacia adelante
    const end = new Date(start);
    end.setDate(start.getDate() + 70);

    const curr = new Date(start);
    while (curr <= end) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return { start, end, dates };
  }, []);

  // Agrupar semanas
  const weeks = useMemo(() => {
    const w: { label: string; days: number; startDate: Date }[] = [];
    let currentWeekStart: Date | null = null;
    let daysInWeek = 0;

    timelineDates.dates.forEach((d) => {
      if (d.getDay() === 1 || currentWeekStart === null) {
        if (currentWeekStart !== null) {
          const validStart: Date = currentWeekStart;
          w.push({
            label: `Sem ${validStart.getDate()} ${validStart.toLocaleString('es-MX', { month: 'short' })}`,
            days: daysInWeek,
            startDate: validStart,
          });
        }
        currentWeekStart = d;
        daysInWeek = 1;
      } else {
        daysInWeek++;
      }
    });

    if (currentWeekStart !== null) {
      const finalStart: Date = currentWeekStart;
      w.push({
        label: `Sem ${finalStart.getDate()} ${finalStart.toLocaleString('es-MX', { month: 'short' })}`,
        days: daysInWeek,
        startDate: finalStart,
      });
    }

    return w;
  }, [timelineDates]);

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterCategory === 'all') return true;
      return t.category === filterCategory;
    });
  }, [tasks, filterCategory]);

  const totalDays = timelineDates.dates.length;

  const getPositionStyles = (startDateStr?: string, dueDateStr?: string) => {
    if (!dueDateStr) return { left: '0%', width: '0%' };

    const due = new Date(dueDateStr);
    const start = startDateStr ? new Date(startDateStr) : new Date(due.getTime() - 4 * 86400000);

    const startTime = timelineDates.start.getTime();
    const endTime = timelineDates.end.getTime();
    const totalTime = endTime - startTime;

    const left = Math.max(0, Math.min(100, ((start.getTime() - startTime) / totalTime) * 100));
    const right = Math.max(0, Math.min(100, ((due.getTime() - startTime) / totalTime) * 100));
    const width = Math.max(3, right - left);

    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  const getStatusColor = (t: Task) => {
    if (t.isBlocked) return 'bg-[#EA580C] text-[#FFFFFF] border-[#C2410C]';
    if (t.status === 'done') return 'bg-[#4A6B53] text-[#FFFFFF] border-[#37513E]';
    if (t.status === 'in_progress') return 'bg-[#C59B27] text-[#FFFFFF] border-[#9A7718]';
    return 'bg-[#8C6239] text-[#FFFFFF] border-[#664627]';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-[#221F1D] tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C59B27]" />
            <span>Cronograma Semanal & Diagrama Gantt</span>
          </h2>
          <p className="text-xs text-[#6E665D]">
            Visión horizontal de actividades críticas, fechas de entrega y dependencias a lo largo del tiempo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-3 py-1.5 text-[#221F1D] focus:outline-none"
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

      {/* Main Gantt Timeline Area */}
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[850px]">
            {/* Timeline Weeks Header */}
            <div className="flex border-b border-[#E6DFD5] bg-[#F8F6F0] text-[11px] font-bold text-[#6E665D]">
              <div className="w-64 p-3 border-r border-[#E6DFD5] shrink-0">
                Actividad / Hito
              </div>
              <div className="flex-1 flex">
                {weeks.map((w, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${(w.days / totalDays) * 100}%` }}
                    className="p-2 border-r border-[#E6DFD5] text-center truncate text-[10px] uppercase tracking-wider text-[#8C6239]"
                  >
                    {w.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Hitos Globales (Banderas en el Cronograma) */}
            {milestones.length > 0 && (
              <div className="bg-[#FAF8F5] border-b border-[#E6DFD5] py-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C6239] px-4 mb-1">
                  🎯 Hitos Clave de Apertura
                </div>
                {milestones.map((m) => {
                  const pos = getPositionStyles(m.deadline, m.deadline);
                  return (
                    <div key={m.id} className="flex items-center hover:bg-[#F2EFE9] text-xs py-1">
                      <div className="w-64 px-4 font-semibold text-[#221F1D] truncate shrink-0 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#C59B27]" />
                        <span className="truncate">{m.title}</span>
                      </div>
                      <div className="flex-1 relative h-6">
                        <div
                          style={{ left: pos.left }}
                          className="absolute -translate-x-1/2 top-0 flex items-center gap-1 bg-[#221F1D] text-[#F8F6F0] text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs whitespace-nowrap z-10"
                        >
                          <span>📍</span>
                          <span>{m.deadline.substring(5)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Lista de Tareas y Barras Gantt */}
            <div className="divide-y divide-[#F2EFE9]">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#A39E93]">
                  No hay actividades con fechas en esta vista.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const partner = partners.find((p) => p.id === task.assignedTo);
                  const styles = getPositionStyles(task.startDate, task.dueDate);
                  const statusClass = getStatusColor(task);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="flex items-center hover:bg-[#FAF8F5] cursor-pointer group py-2.5 transition-colors"
                    >
                      {/* Left Label */}
                      <div className="w-64 px-4 shrink-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          {task.isBlocked && (
                            <span className="text-[10px] font-bold text-[#EA580C]">⚠️</span>
                          )}
                          <span className="text-xs font-semibold text-[#221F1D] group-hover:text-[#8C6239] truncate">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#A39E93]">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{partner?.shortName || 'Sin asignar'}</span>
                        </div>
                      </div>

                      {/* Right Gantt Bar Lane */}
                      <div className="flex-1 relative h-7">
                        {/* Grid lines background */}
                        <div className="absolute inset-0 flex pointer-events-none opacity-40">
                          {weeks.map((w, idx) => (
                            <div
                              key={idx}
                              style={{ width: `${(w.days / totalDays) * 100}%` }}
                              className="h-full border-r border-[#E6DFD5] border-dashed"
                            />
                          ))}
                        </div>

                        {/* Gantt Bar */}
                        <div
                          style={{
                            left: styles.left,
                            width: styles.width,
                          }}
                          className={`absolute top-0.5 h-6 rounded-lg px-2 flex items-center justify-between text-[10px] font-semibold border shadow-2xs transition-all overflow-hidden whitespace-nowrap ${statusClass}`}
                          title={`${task.title} | ${task.dueDate} | ${task.isBlocked ? 'BLOQUEADA: ' + task.blockerReason : task.status}`}
                        >
                          <span className="truncate pr-1">{task.title}</span>
                          <span className="text-[9px] opacity-90">{task.dueDate.substring(5)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Task, Partner, LogbookEntry, Milestone } from '@/types';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  partners: Partner[];
  logbook: LogbookEntry[];
  milestones: Milestone[];
  budget: number;
  onSelectTask: (task: Task) => void;
  onGoToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  partners,
  logbook,
  milestones,
  budget,
  onSelectTask,
  onGoToTab,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');

  // El porcentaje de avance calcula exactamente tareas completadas / total de tareas
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner de Resumen */}
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4A6B53] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#8C6239]">
              Planeación de Apertura · Puebla
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#221F1D] tracking-tight">
            Resumen General de Apertura
          </h1>
          <p className="text-xs text-[#6E665D] mt-1 max-w-xl leading-relaxed">
            Avance en tiempo real de actividades críticas: adecuación física, equipamiento, trámites y recetas.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#F8F6F0] border border-[#E6DFD5] px-5 py-3.5 rounded-2xl shrink-0">
          <div>
            <p className="text-[10px] text-[#6E665D] uppercase font-bold tracking-wider">Avance Global</p>
            <p className="text-2xl font-bold text-[#221F1D]">{completionRate}%</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#C59B27] border-t-transparent flex items-center justify-center font-bold text-xs text-[#221F1D]">
            {completedTasks}/{totalTasks}
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#8C6239] mb-2">
            <span className="text-xs font-semibold">Tareas en Curso</span>
            <Clock className="w-4 h-4 text-[#C59B27]" />
          </div>
          <p className="text-2xl font-bold text-[#221F1D]">{inProgressTasks}</p>
          <p className="text-[11px] text-[#6E665D] mt-1">Actividades ejecutándose</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#DC2626] mb-2">
            <span className="text-xs font-semibold">Atención Urgente</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#221F1D]">{urgentTasks.length}</p>
          <p className="text-[11px] text-[#6E665D] mt-1">Pendientes de alta prioridad</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#16A34A] mb-2">
            <span className="text-xs font-semibold">Completadas</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#221F1D]">{completedTasks}</p>
          <p className="text-[11px] text-[#6E665D] mt-1">Tareas finalizadas</p>
        </div>

        {/* Presupuesto */}
        <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#221F1D] mb-2">
            <span className="text-xs font-semibold">Presupuesto CAPEX</span>
            <TrendingUp className="w-4 h-4 text-[#C59B27]" />
          </div>
          <p className="text-2xl font-bold text-[#221F1D]">
            ${budget.toLocaleString('es-MX')}
          </p>
          <p className="text-[11px] text-[#6E665D] mt-1">MXN Estimado</p>
        </div>
      </div>

      {/* Balance Dinámico por Socio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C59B27]" />
              <h2 className="text-sm font-bold text-[#221F1D]">Distribución de Trabajo</h2>
            </div>
            <span className="text-[10px] text-[#6E665D] bg-[#F2EFE9] px-2.5 py-0.5 rounded-full font-medium">
              Por Socio
            </span>
          </div>

          <div className="space-y-3">
            {partners.map((partner, index) => {
              const partnerTasks = tasks.filter(
                (t) => t.assignedTo === partner.id && t.status !== 'done'
              );
              const percent = totalTasks > 0 ? (partnerTasks.length / totalTasks) * 100 : 0;
              const barColor = index % 2 === 0 ? 'bg-[#8C6239]' : 'bg-[#C59B27]';

              return (
                <div key={partner.id} className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#E6DFD5]">
                  <div className="flex justify-between text-xs font-bold text-[#221F1D] mb-1">
                    <span>{partner.name} ({partner.shortName})</span>
                    <span className="text-[#8C6239]">{partnerTasks.length} pendientes</span>
                  </div>
                  <p className="text-[11px] text-[#6E665D] mb-2">{partner.role || 'Cofundador'}</p>
                  <div className="w-full bg-[#EBE7DF] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Últimos Acuerdos en Bitácora */}
        <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#221F1D]">Últimos Acuerdos & Decisiones</h2>
              <button
                onClick={() => onGoToTab('logbook')}
                className="text-xs font-semibold text-[#8C6239] hover:text-[#C59B27]"
              >
                Ver Bitácora →
              </button>
            </div>

            <div className="space-y-2.5">
              {logbook.length === 0 ? (
                <div className="bg-[#F8F6F0] p-4 rounded-xl text-center text-xs text-[#A39E93]">
                  No hay minutas registradas aún.
                </div>
              ) : (
                logbook.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#F8F6F0] p-3 rounded-xl border border-[#E6DFD5] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#8C6239]">{item.category}</span>
                      <span className="text-[#A39E93]">{item.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#221F1D] line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-[#6E665D] line-clamp-2 leading-relaxed">{item.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#F2EFE9] flex justify-between items-center text-xs text-[#6E665D]">
            <span>Hito más próximo:</span>
            <span className="font-bold text-[#221F1D]">{milestones[0]?.title || 'Por definir'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

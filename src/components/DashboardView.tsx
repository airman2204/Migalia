'use client';

import React from 'react';
import { Task, Partner, LogbookEntry, Milestone } from '@/types';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  partners: Partner[];
  logbook: LogbookEntry[];
  milestones: Milestone[];
  onSelectTask: (task: Task) => void;
  onGoToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  partners,
  logbook,
  milestones,
  onSelectTask,
  onGoToTab,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done');

  // Balance por socio
  const partner1Tasks = tasks.filter((t) => t.assignedTo === 'partner-1' && t.status !== 'done');
  const partner2Tasks = tasks.filter((t) => t.assignedTo === 'partner-2' && t.status !== 'done');

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Welcome / Status */}
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4A6B53] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#8C6239]">
              Fase I · Puebla en Marcha
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#221F1D] tracking-tight">
            Coordinación de Apertura MÍGALIA
          </h1>
          <p className="text-xs text-[#6E665D] mt-1 max-w-xl leading-relaxed">
            Monitoreo en tiempo real de actividades críticas: Obra civil chukum, cotización de hornos, constitución S.A. de C.V. y pruebas de recetas.
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
          <div className="flex items-center justify-between text-[#C84B31] mb-2">
            <span className="text-xs font-semibold">Atención Urgente</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#221F1D]">{urgentTasks.length}</p>
          <p className="text-[11px] text-[#6E665D] mt-1">Requieren resolución hoy</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#4A6B53] mb-2">
            <span className="text-xs font-semibold">Completadas</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-[#221F1D]">{completedTasks}</p>
          <p className="text-[11px] text-[#6E665D] mt-1">Hitos cerrados</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#221F1D] mb-2">
            <span className="text-xs font-semibold">Presupuesto CAPEX</span>
            <TrendingUp className="w-4 h-4 text-[#C59B27]" />
          </div>
          <p className="text-2xl font-bold text-[#221F1D]">$250,000</p>
          <p className="text-[11px] text-[#6E665D] mt-1">MXN · Ronda Semilla</p>
        </div>
      </div>

      {/* Balance de Carga entre Socios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C59B27]" />
              <h2 className="text-sm font-bold text-[#221F1D]">Balance de Carga de Socios</h2>
            </div>
            <span className="text-[10px] text-[#6E665D] bg-[#F2EFE9] px-2 py-0.5 rounded-full font-medium">
              Equidad de trabajo
            </span>
          </div>

          <div className="space-y-3">
            {/* Socio A */}
            <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#E6DFD5]">
              <div className="flex justify-between text-xs font-bold text-[#221F1D] mb-1">
                <span>{partners[0]?.name} (Socio A)</span>
                <span className="text-[#8C6239]">{partner1Tasks.length} pendientes</span>
              </div>
              <p className="text-[11px] text-[#6E665D] mb-2">{partners[0]?.role}</p>
              <div className="w-full bg-[#EBE7DF] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#8C6239] h-full rounded-full"
                  style={{ width: `${Math.min((partner1Tasks.length / totalTasks) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Socio B */}
            <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#E6DFD5]">
              <div className="flex justify-between text-xs font-bold text-[#221F1D] mb-1">
                <span>{partners[1]?.name} (Socio B)</span>
                <span className="text-[#C59B27]">{partner2Tasks.length} pendientes</span>
              </div>
              <p className="text-[11px] text-[#6E665D] mb-2">{partners[1]?.role}</p>
              <div className="w-full bg-[#EBE7DF] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#C59B27] h-full rounded-full"
                  style={{ width: `${Math.min((partner2Tasks.length / totalTasks) * 100, 100)}%` }}
                />
              </div>
            </div>
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
              {logbook.slice(0, 2).map((item) => (
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
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#F2EFE9] flex justify-between items-center text-xs text-[#6E665D]">
            <span>Hito más próximo:</span>
            <span className="font-bold text-[#221F1D]">{milestones[0]?.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

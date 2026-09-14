'use client';

import React from 'react';
import { LayoutDashboard, Columns3, BookOpen, CalendarRange, FolderKanban } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'kanban' | 'tasks' | 'logbook' | 'milestones';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  counts: {
    total: number;
    inProgress: number;
    logbook: number;
    milestones: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Resumen Ejecutivo', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'kanban', label: 'Tablero Kanban', icon: <Columns3 className="w-4 h-4" />, badge: counts.total },
    { id: 'tasks', label: 'Lista de Actividades', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'logbook', label: 'Bitácora & Minutas', icon: <BookOpen className="w-4 h-4" />, badge: counts.logbook },
    { id: 'milestones', label: 'Hitos & Cronograma', icon: <CalendarRange className="w-4 h-4" />, badge: counts.milestones },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#F2EFE9] border-r border-[#E6DFD5] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="mb-4 px-2">
          <p className="text-[10px] font-bold tracking-wider uppercase text-[#6E665D]">
            Etapa 1 · Apertura Puebla
          </p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#221F1D] text-[#F8F6F0] shadow-sm'
                    : 'text-[#6E665D] hover:bg-[#EBE7DF] hover:text-[#221F1D]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#C59B27]' : 'text-[#8C6239]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-[#34302C] text-[#C59B27]'
                        : 'bg-[#DDD5C7] text-[#221F1D]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mini Card de Balance de Socios */}
      <div className="mt-8 bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 rounded-2xl shadow-xs">
        <p className="text-[11px] font-semibold text-[#221F1D] mb-1">
          Coordinación Activa
        </p>
        <p className="text-[10px] text-[#6E665D] mb-2.5 leading-relaxed">
          Herramienta privada para asegurar la apertura a tiempo y sin costes extras.
        </p>
        <div className="flex items-center justify-between text-[11px] text-[#6E665D] pt-2 border-t border-[#E6DFD5]">
          <span>Semilla:</span>
          <span className="font-bold text-[#221F1D]">$250k MXN</span>
        </div>
      </div>
    </aside>
  );
};

'use client';

import React from 'react';
import { LayoutDashboard, Columns3, BookOpen, CalendarRange, FolderKanban, Settings } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'tasks' | 'kanban' | 'logbook' | 'milestones';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  counts: {
    total: number;
    inProgress: number;
    logbook: number;
    milestones: number;
  };
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  counts,
  onOpenSettings,
}) => {
  // Orden estratégico: Lista de Actividades PRIMERO para registrar y planear, luego Tablero Kanban para ejecutar
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Resumen Ejecutivo', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Lista de Actividades', icon: <FolderKanban className="w-4 h-4" />, badge: counts.total },
    { id: 'kanban', label: 'Tablero Kanban', icon: <Columns3 className="w-4 h-4" /> },
    { id: 'logbook', label: 'Bitácora & Minutas', icon: <BookOpen className="w-4 h-4" />, badge: counts.logbook },
    { id: 'milestones', label: 'Hitos & Cronograma', icon: <CalendarRange className="w-4 h-4" />, badge: counts.milestones },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#F2EFE9] border-r border-[#E6DFD5] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="mb-4 px-2">
          <p className="text-[10px] font-bold tracking-wider uppercase text-[#6E665D]">
            Planeación · Boutique Puebla
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

      {/* Botón de Configuración de Socios y Presupuesto */}
      <div className="mt-8 space-y-3">
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#8C6239] hover:text-[#221F1D] hover:bg-[#EBE7DF] border border-[#DDD5C7] transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Configurar Socios & Fondos</span>
          </button>
        )}

        <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-3 rounded-2xl text-[11px] text-[#6E665D] space-y-1">
          <p className="font-semibold text-[#221F1D]">Espacio de Cofundadores</p>
          <p className="text-[10px] leading-relaxed">
            Coordinación activa para la apertura en tiempo y forma.
          </p>
        </div>
      </div>
    </aside>
  );
};

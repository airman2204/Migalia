'use client';

import React from 'react';
import { LayoutDashboard, Columns3, BookOpen, CalendarRange, FolderKanban, Settings, ChefHat, Files, Sparkles } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'tasks' | 'kanban' | 'recipes' | 'documents' | 'logbook' | 'milestones' | 'miga_ai';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  counts: {
    total: number;
    inProgress: number;
    logbook: number;
    milestones: number;
    recipes?: number;
    documents?: number;
  };
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  counts,
  onOpenSettings,
}) => {
  // Orden estratégico: Actividades, Kanban, Recetario & Costeo, Documentos & Archivos, Bitácora, Hitos
  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Resumen Ejecutivo', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Lista de Actividades', icon: <FolderKanban className="w-4 h-4" />, badge: counts.total },
    { id: 'kanban', label: 'Tablero Kanban', icon: <Columns3 className="w-4 h-4" /> },
    { id: 'recipes', label: 'Recetario & Costeo', icon: <ChefHat className="w-4 h-4" />, badge: counts.recipes },
    { id: 'documents', label: 'Documentos & Archivos', icon: <Files className="w-4 h-4" />, badge: counts.documents },
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

      {/* Sección Inferior: Miga AI y Configuración */}
      <div className="mt-8 space-y-2">
        {/* Botón Miga AI - Destacado arriba de configuración */}
        <button
          onClick={() => onTabChange('miga_ai')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
            activeTab === 'miga_ai'
              ? 'bg-gradient-to-r from-[#221F1D] to-[#34302C] text-amber-400 border-amber-500/40 shadow-amber-900/10'
              : 'bg-white hover:bg-stone-50 text-stone-800 border-amber-300/60 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="text-left">
              <div className="leading-tight flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm">Miga AI</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-mono font-normal">
                  Copilot
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-normal">Reportes & Marketing</p>
            </div>
          </div>
        </button>

        {/* Botón de Configuración hasta abajo */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#8C6239] hover:text-[#221F1D] hover:bg-[#EBE7DF] border border-[#DDD5C7] transition-all shadow-2xs"
          >
            <Settings className="w-4 h-4 text-[#C59B27]" />
            <span>Configuración</span>
          </button>
        )}
      </div>
    </aside>
  );
};

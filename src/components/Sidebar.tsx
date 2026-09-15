'use client';

import React from 'react';
import { LayoutDashboard, Columns3, BookOpen, CalendarRange, FolderKanban, Settings, ChefHat, Files, Sparkles, FileSpreadsheet } from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'tasks'
  | 'kanban'
  | 'recipes'
  | 'documents'
  | 'logbook'
  | 'milestones'
  | 'calendar'
  | 'calls'
  | 'miga_ai';

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
    { id: 'documents', label: 'Google Sheets', icon: <FileSpreadsheet className="w-4 h-4 text-[#0F9D58]" />, badge: counts.documents },
    { id: 'logbook', label: 'Bitácora & Minutas', icon: <BookOpen className="w-4 h-4" />, badge: counts.logbook },
    { id: 'milestones', label: 'Hitos & Cronograma', icon: <CalendarRange className="w-4 h-4" />, badge: counts.milestones },
  ];

  return (
    <aside className="w-full md:w-64 h-full bg-[#F2EFE9] border-r border-[#E6DFD5] p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
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
        {/* Botón Miga AI - Justo arriba de configuración */}
        <button
          onClick={() => onTabChange('miga_ai')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-xs ${
            activeTab === 'miga_ai'
              ? 'bg-[#221F1D] text-amber-400 border-amber-500/40 shadow-sm'
              : 'bg-white hover:bg-stone-50 text-[#221F1D] border-amber-200/70 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Logo Propio Miga AI: Isotipo de Corona de Trigo / Estrella Neuronal */}
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#221F1D] via-[#34302C] to-[#1A1816] flex items-center justify-center border border-amber-500/40 shadow-xs shrink-0 overflow-hidden group">
              <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent opacity-75" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-amber-400 relative z-10 drop-shadow-[0_1px_2px_rgba(197,155,39,0.5)]"
              >
                {/* Isotipo: Nódulo M con destellos de IA y espiga de trigo */}
                <path
                  d="M4 19L7 8L12 14L17 8L20 19"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="5" r="2" fill="#F59E0B" />
                <circle cx="7" cy="8" r="1.2" fill="#FBBF24" />
                <circle cx="17" cy="8" r="1.2" fill="#FBBF24" />
              </svg>
            </div>

            <div className="text-left">
              <span className="font-serif font-bold text-sm leading-none tracking-tight block">
                Miga AI
              </span>
            </div>
          </div>
        </button>

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

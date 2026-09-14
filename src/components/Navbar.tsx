'use client';

import React from 'react';
import { Partner } from '@/types';
import { User, Users, Plus, Bell } from 'lucide-react';

interface NavbarProps {
  currentFilter: 'all' | string;
  onFilterChange: (filter: 'all' | string) => void;
  partners: Partner[];
  onOpenNewTask: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFilter,
  onFilterChange,
  partners,
  onOpenNewTask,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#E6DFD5] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline tracking-widest text-[#221F1D]">
            <span className="text-xl md:text-2xl font-bold tracking-[0.25em]">M</span>
            <span className="text-xl md:text-2xl font-bold tracking-[0.25em] relative">
              I
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[#C59B27] rounded-sm transform rotate-12" />
            </span>
            <span className="text-xl md:text-2xl font-bold tracking-[0.25em]">GALIA</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider text-[#6E665D] font-medium border-l border-[#DDD5C7] pl-3">
            Planeación & Coordinación
          </span>
        </div>

        {/* Center Pill: "Mi Espacio" vs "Vista Global" */}
        <div className="flex items-center bg-[#EBE7DF] p-1 rounded-full border border-[#DDD5C7] shadow-inner text-xs font-medium">
          <button
            onClick={() => onFilterChange('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              currentFilter === 'all'
                ? 'bg-[#221F1D] text-[#F8F6F0] shadow-sm font-semibold'
                : 'text-[#6E665D] hover:text-[#221F1D]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Vista Global</span>
          </button>

          {partners.map((partner) => (
            <button
              key={partner.id}
              onClick={() => onFilterChange(partner.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                currentFilter === partner.id
                  ? 'bg-[#221F1D] text-[#F8F6F0] shadow-sm font-semibold'
                  : 'text-[#6E665D] hover:text-[#221F1D]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{partner.shortName}</span>
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-medium transition-all shadow-sm active:scale-95 border border-[#34302C]"
          >
            <Plus className="w-4 h-4 text-[#C59B27]" />
            <span className="hidden sm:inline">Nueva Actividad</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-[#EBE7DF] border border-[#DDD5C7] flex items-center justify-center text-[#221F1D] font-bold text-xs">
            M
          </div>
        </div>
      </div>
    </header>
  );
};

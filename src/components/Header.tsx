'use client'

import React from 'react'
import { LayoutGrid, User, LogOut } from 'lucide-react'

interface HeaderProps {
  viewMode: 'global' | 'mi-espacio'
  setViewMode: (mode: 'global' | 'mi-espacio') => void
  activeUser: 'Socio A' | 'Socio B'
  setActiveUser: (user: 'Socio A' | 'Socio B') => void
  onLogout?: () => void
}

export default function Header({
  viewMode,
  setViewMode,
  activeUser,
  setActiveUser,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF6EF]/90 border-b border-[#E2D7CB] px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LOGO EXACTO DE LA MARCA MIGALIA */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline font-serif tracking-[0.15em] text-3xl font-bold text-[#2B1D19]">
            <span>M</span>
            <span className="relative inline-flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A07835] mb-0.5 shadow-sm"></span>
              <span>I</span>
            </span>
            <span>GALIA</span>
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-widest px-2.5 py-0.5 rounded-full bg-[#F1EAE1] text-[#7A6658] border border-[#E2D7CB]">
            Hub Privado
          </span>
        </div>

        {/* CONTROLES DE VISTA Y USUARIO */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Vista Global vs Mi Espacio */}
          <div className="bg-[#F1EAE1] p-1 rounded-xl border border-[#E2D7CB] flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setViewMode('global')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'global'
                  ? 'bg-[#FFFFFF] text-[#2B1D19] shadow-sm border border-[#E2D7CB]'
                  : 'text-[#7A6658] hover:text-[#2B1D19]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Vista Global
            </button>
            <button
              onClick={() => setViewMode('mi-espacio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'mi-espacio'
                  ? 'bg-[#A07835] text-[#FFFFFF] shadow-sm'
                  : 'text-[#7A6658] hover:text-[#2B1D19]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Mi Espacio
            </button>
          </div>

          {/* Selector de Socio Activo */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] px-3 py-1 rounded-xl border border-[#E2D7CB] shadow-sm">
            <span className="text-[11px] font-semibold text-[#7A6658]">Socio:</span>
            <select
              value={activeUser}
              onChange={(e) => setActiveUser(e.target.value as 'Socio A' | 'Socio B')}
              className="bg-transparent text-xs font-bold text-[#2B1D19] outline-none cursor-pointer"
            >
              <option value="Socio A">Socio A (Ana)</option>
              <option value="Socio B">Socio B (Bernardo)</option>
            </select>
          </div>

          {/* Botón Logout */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-2 text-[#7A6658] hover:text-rose-700 bg-[#F1EAE1] hover:bg-rose-50 rounded-xl border border-[#E2D7CB] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

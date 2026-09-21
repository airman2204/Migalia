import React from 'react';
import Image from 'next/image';
import { Partner } from '@/types';
import { User, Users, Plus, LogOut, MessageSquare, Calendar, Video, Search } from 'lucide-react';

interface NavbarProps {
  currentFilter: 'all' | string;
  onFilterChange: (filter: 'all' | string) => void;
  partners: Partner[];
  currentPartner: Partner | null;
  onLogout: () => void;
  onOpenChat?: () => void;
  onOpenCalendar?: () => void;
  onLaunchStudio?: () => void;
  unreadCount?: number;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFilter,
  onFilterChange,
  partners,
  currentPartner,
  onLogout,
  onOpenChat,
  onOpenCalendar,
  onLaunchStudio,
  unreadCount = 0,
  onOpenSearch,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#E6DFD5] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#E6DFD5] shadow-xs flex items-center justify-center overflow-hidden shrink-0">
            <Image
              src="/icon.png"
              alt="MÍGALIA"
              width={26}
              height={26}
              className="w-6 h-6 object-contain"
              priority
            />
          </div>
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

          {partners.map((partner) => {
            // Un socio está en línea si Supabase Presence lo marca true O si coincide con el usuario actualmente logueado
            const isCurrent =
              Boolean(currentPartner) &&
              (partner.id === currentPartner?.id ||
                (partner.email && currentPartner?.email && partner.email.toLowerCase() === currentPartner.email.toLowerCase()) ||
                (partner.name && currentPartner?.name && partner.name.toLowerCase().includes(currentPartner.name.toLowerCase())));

            const isOnline = partner.isOnline || isCurrent;
            return (
              <button
                key={partner.id}
                onClick={() => onFilterChange(partner.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  currentFilter === partner.id
                    ? 'bg-[#221F1D] text-[#F8F6F0] shadow-sm font-semibold'
                    : 'text-[#6E665D] hover:text-[#221F1D]'
                }`}
                title={`${partner.name} - ${isOnline ? 'En línea (Disponible)' : 'Desconectado'}`}
              >
                <span className="relative flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                      isOnline ? 'bg-emerald-500 ring-1 ring-emerald-300' : 'bg-stone-300'
                    }`}
                  />
                </span>
                <span>{partner.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EBE7DF] text-[#6E665D] hover:text-[#221F1D] border border-[#DDD5C7] rounded-full text-xs font-semibold transition shadow-2xs"
              title="Buscar en todo el sistema (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-[#8C6239]" />
              <span className="hidden lg:inline text-[11px]">Buscar...</span>
              <kbd className="hidden sm:inline-block text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.2 rounded border border-stone-200 font-mono">
                ⌘K
              </kbd>
            </button>
          )}

          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#EBE7DF] text-[#221F1D] border border-[#DDD5C7] rounded-full text-xs font-semibold transition shadow-2xs"
              title="Calendario Interno de Sesiones"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Calendario</span>
            </button>
          )}

          {onLaunchStudio && (
            <button
              onClick={onLaunchStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold transition shadow-xs"
              title="Iniciar Sesión WebRTC Nativa"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Llamada</span>
            </button>
          )}

          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] rounded-full text-xs font-semibold transition shadow-xs"
              title="Abrir Chat Interno de Socios"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C59B27]" />
              <span className="hidden sm:inline">Chat</span>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-amber-500 text-stone-950 rounded-full text-[10px] font-extrabold animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-1">
            <div
              title={`Sesión iniciada como ${currentPartner?.name || 'Socio'} (En línea)`}
              className="relative w-8 h-8 rounded-full bg-[#EBE7DF] border border-[#DDD5C7] flex items-center justify-center text-[#221F1D] font-bold text-xs"
            >
              {currentPartner?.shortName?.charAt(0) || currentPartner?.name?.charAt(0) || 'M'}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-1.5 rounded-lg text-[#6E665D] hover:text-[#C84B31] hover:bg-[#FDF0ED] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

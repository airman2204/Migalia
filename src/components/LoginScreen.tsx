'use client';

import React, { useState } from 'react';
import { Partner } from '@/types';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  partners: Partner[];
  onLogin: (partner: Partner) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ partners, onLogin }) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSimulation = (partner: Partner) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(partner);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-baseline tracking-widest text-[#221F1D]">
          <span className="text-2xl font-bold tracking-[0.25em]">M</span>
          <span className="text-2xl font-bold tracking-[0.25em] relative">
            I
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[#C59B27] rounded-sm transform rotate-12" />
          </span>
          <span className="text-2xl font-bold tracking-[0.25em]">GALIA</span>
        </div>
        <div className="flex items-center gap-2 bg-[#EBE7DF] px-3 py-1 rounded-full text-xs font-semibold text-[#6E665D] border border-[#DDD5C7]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>Acceso Privado · Socios Fundadores</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-12 bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Etapa 1: Planeación de Apertura</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#221F1D] tracking-tight">
            Bienvenido a MÍGALIA
          </h1>
          <p className="text-xs text-[#6E665D] leading-relaxed">
            Plataforma interna para coordinar obra, trámites, recetas y cronograma de apertura de la boutique en Puebla.
          </p>
        </div>

        {/* Acceso rápido con Google */}
        <div className="space-y-3 pt-2">
          <p className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider text-center">
            Selecciona tu Perfil de Socio
          </p>

          <div className="space-y-2.5">
            {partners.map((p) => (
              <button
                key={p.id}
                onClick={() => handleGoogleSimulation(p)}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#E6DFD5] hover:border-[#C59B27] hover:bg-[#FAF8F5] transition-all duration-150 group text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Google style colored icon / Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-[#F2EFE9] border border-[#DDD5C7] flex items-center justify-center text-sm font-bold text-[#221F1D] group-hover:bg-[#C59B27] group-hover:text-[#FFFFFF] transition-colors">
                    {p.name.charAt(p.name.length - 1)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#221F1D] group-hover:text-[#8C6239]">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-[#6E665D]">{p.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6239] group-hover:text-[#C59B27]">
                  <span className="hidden sm:inline">Entrar</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E6DFD5]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#FFFFFF] px-2 text-[#A39E93] font-semibold tracking-wider">
                Autenticación Google OAuth
              </span>
            </div>
          </div>

          {/* Botón clásico de Google */}
          <button
            onClick={() => handleGoogleSimulation(partners[0])}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#FFFFFF] border border-[#DDD5C7] hover:bg-[#F8F6F0] text-[#221F1D] text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Autenticando...' : 'Iniciar Sesión con Google'}</span>
          </button>
        </div>

        {/* Info de Seguridad & Coste */}
        <div className="pt-2 text-center text-[10px] text-[#A39E93] space-y-1">
          <p>Conectado a Supabase Auth · Servidores Seguros</p>
          <p>Sin costos recurrentes (Free Tier Activo)</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[#6E665D]">
        MÍGALIA BAKERY · Puebla / Expansión EE. UU. (Visa E-2)
      </footer>
    </div>
  );
};

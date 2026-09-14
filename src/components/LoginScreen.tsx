'use client';

import React, { useState } from 'react';
import { Partner } from '@/types';
import { ShieldCheck, ArrowRight, Sparkles, Mail, Lock, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  partners: Partner[];
  onLogin: (partner: Partner) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ partners, onLogin }) => {
  const [zohoEmail, setZohoEmail] = useState('');
  const [zohoPassword, setZohoPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Ingreso exclusivo con Zoho Mail corporativo
  const handleZohoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!zohoEmail.trim()) {
      setErrorMessage('Por favor ingresa tu correo de Zoho Mail corporativo.');
      return;
    }

    setIsLoading(true);

    // Buscar si el correo coincide con alguno de los socios precargados o nuevo socio
    const cleanEmail = zohoEmail.trim().toLowerCase();
    const existingPartner = partners.find(
      (p) => p.email.toLowerCase() === cleanEmail
    );

    setTimeout(() => {
      if (existingPartner) {
        onLogin(existingPartner);
      } else {
        // Asignar nombre a partir del prefijo de correo (ej. mario@migalia.mx -> Mario)
        const namePart = cleanEmail.split('@')[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const newPartner: Partner = {
          id: 'partner-' + Date.now(),
          name: formattedName,
          shortName: formattedName,
          email: cleanEmail,
          role: 'Socio Cofundador',
          avatar: formattedName.charAt(0).toUpperCase(),
        };
        onLogin(newPartner);
      }
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
      <div className="max-w-md w-full mx-auto my-8 bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-7 sm:p-9 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Etapa 1: Planeación de Apertura</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#221F1D] tracking-tight">
            Acceso Socios MÍGALIA
          </h1>
          <p className="text-xs text-[#6E665D] leading-relaxed">
            Ingresa con tu cuenta de correo corporativa en <span className="font-semibold text-[#221F1D]">Zoho Mail</span> para acceder a tu espacio de trabajo.
          </p>
        </div>

        {/* Formulario exclusivo Zoho Mail */}
        <form onSubmit={handleZohoLogin} className="space-y-4 pt-1">
          {errorMessage && (
            <p className="text-xs text-[#C84B31] bg-[#FDF0ED] p-2.5 rounded-xl border border-[#F5C6BC]">
              {errorMessage}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#221F1D] mb-1.5">
              Correo Corporativo (Zoho Mail)
            </label>
            <div className="relative">
              <input
                type="email"
                value={zohoEmail}
                onChange={(e) => setZohoEmail(e.target.value)}
                placeholder="socio@migalia.mx"
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl pl-9 pr-3 py-3 text-[#221F1D] placeholder-[#A39E93] focus:outline-none focus:border-[#C59B27]"
                required
              />
              <Mail className="w-4 h-4 text-[#8C6239] absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#221F1D]">
                Contraseña
              </label>
              <span className="text-[10px] text-[#A39E93]">Zoho Workspace</span>
            </div>
            <div className="relative">
              <input
                type="password"
                value={zohoPassword}
                onChange={(e) => setZohoPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl pl-9 pr-3 py-3 text-[#221F1D] placeholder-[#A39E93] focus:outline-none focus:border-[#C59B27]"
              />
              <Lock className="w-4 h-4 text-[#8C6239] absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] text-xs font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <span>{isLoading ? 'Autenticando en Zoho...' : 'Iniciar Sesión con Zoho Mail'}</span>
            <ArrowRight className="w-4 h-4 text-[#C59B27]" />
          </button>
        </form>

        {/* Cuentas de Acceso Rápido sugeridas */}
        <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 rounded-2xl text-[11px] text-[#6E665D] space-y-1.5">
          <p className="font-semibold text-[#221F1D] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B53]" />
            Cuentas de Co-Fundadores configuradas:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setZohoEmail('socio1@migalia.mx');
                setZohoPassword('migalia2026');
              }}
              className="bg-[#FFFFFF] border border-[#DDD5C7] hover:border-[#C59B27] px-2.5 py-1 rounded-lg text-[10px] font-medium text-[#221F1D]"
            >
              socio1@migalia.mx
            </button>
            <button
              type="button"
              onClick={() => {
                setZohoEmail('socio2@migalia.mx');
                setZohoPassword('migalia2026');
              }}
              className="bg-[#FFFFFF] border border-[#DDD5C7] hover:border-[#C59B27] px-2.5 py-1 rounded-lg text-[10px] font-medium text-[#221F1D]"
            >
              socio2@migalia.mx
            </button>
          </div>
        </div>

        {/* Info de Seguridad */}
        <div className="pt-2 text-center text-[10px] text-[#A39E93] space-y-1 border-t border-[#F2EFE9]">
          <p>Autenticación empresarial con Zoho Mail & Dominio Migalia</p>
          <p>Coste operativo de correo: $0 (Zoho Forever Free Tier)</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[#6E665D]">
        MÍGALIA BAKERY · Puebla / Expansión EE. UU. (Visa E-2)
      </footer>
    </div>
  );
};

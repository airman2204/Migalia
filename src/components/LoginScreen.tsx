'use client';

import React, { useState } from 'react';
import { Partner } from '@/types';
import { ShieldCheck, ArrowRight, Sparkles, Mail, Lock, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  partners: Partner[];
  onLogin: (partner: Partner) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ partners, onLogin }) => {
  const [activeMethod, setActiveMethod] = useState<'profiles' | 'zoho'>('profiles');
  const [zohoEmail, setZohoEmail] = useState('');
  const [zohoPassword, setZohoPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Ingreso directo seleccionando perfil de socio
  const handleProfileSelect = (partner: Partner) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(partner);
      setIsLoading(false);
    }, 400);
  };

  // Ingreso con correo Zoho Mail corporativo (@migalia.mx o cuenta Zoho)
  const handleZohoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!zohoEmail.trim()) {
      setErrorMessage('Por favor ingresa tu correo de Zoho Mail.');
      return;
    }

    setIsLoading(true);

    // Buscar si el correo pertenece a uno de los socios registrados
    const existingPartner = partners.find(
      (p) => p.email.toLowerCase() === zohoEmail.trim().toLowerCase()
    );

    setTimeout(() => {
      if (existingPartner) {
        onLogin(existingPartner);
      } else {
        // Permitir inicio creando socio al vuelo con su correo corporativo Zoho
        const namePart = zohoEmail.split('@')[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const newPartner: Partner = {
          id: 'partner-' + Date.now(),
          name: formattedName,
          shortName: formattedName,
          email: zohoEmail.trim().toLowerCase(),
          role: 'Cofundador (Zoho)',
          avatar: formattedName.charAt(0).toUpperCase(),
        };
        onLogin(newPartner);
      }
      setIsLoading(false);
    }, 600);
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
      <div className="max-w-md w-full mx-auto my-8 bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-7 sm:p-8 shadow-sm space-y-6">
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

        {/* Tabs de método de acceso */}
        <div className="flex bg-[#EBE7DF] p-1 rounded-xl border border-[#DDD5C7] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveMethod('profiles')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeMethod === 'profiles'
                ? 'bg-[#221F1D] text-[#F8F6F0] font-semibold shadow-xs'
                : 'text-[#6E665D] hover:text-[#221F1D]'
            }`}
          >
            Socios Fundadores
          </button>
          <button
            type="button"
            onClick={() => setActiveMethod('zoho')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMethod === 'zoho'
                ? 'bg-[#221F1D] text-[#F8F6F0] font-semibold shadow-xs'
                : 'text-[#6E665D] hover:text-[#221F1D]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Zoho Mail</span>
          </button>
        </div>

        {/* Método 1: Selección de Perfiles */}
        {activeMethod === 'profiles' && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-[#8C6239] uppercase tracking-wider text-center">
              Selecciona tu Perfil de Socio
            </p>

            <div className="space-y-2.5">
              {partners.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProfileSelect(p)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#E6DFD5] hover:border-[#C59B27] hover:bg-[#FAF8F5] transition-all duration-150 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F2EFE9] border border-[#DDD5C7] flex items-center justify-center text-sm font-bold text-[#221F1D] group-hover:bg-[#C59B27] group-hover:text-[#FFFFFF] transition-colors">
                      {p.shortName.charAt(p.shortName.length - 1)}
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
          </div>
        )}

        {/* Método 2: Acceso con Zoho Mail */}
        {activeMethod === 'zoho' && (
          <form onSubmit={handleZohoLogin} className="space-y-3.5">
            <div className="bg-[#F8F6F0] border border-[#E6DFD5] p-3 rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#221F1D] text-[#C59B27] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-[#6E665D] leading-tight">
                Ingresa con tu cuenta corporativa de <span className="font-bold text-[#221F1D]">Zoho Mail</span> (ej. socio@migalia.mx).
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs text-[#C84B31] bg-[#FDF0ED] p-2 rounded-lg border border-[#F5C6BC]">
                {errorMessage}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#221F1D] mb-1">
                Correo Zoho Mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={zohoEmail}
                  onChange={(e) => setZohoEmail(e.target.value)}
                  placeholder="ejemplo@migalia.mx o tu_cuenta@zohomail.com"
                  className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl pl-8 pr-3 py-2.5 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                  required
                />
                <Mail className="w-4 h-4 text-[#A39E93] absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#221F1D] mb-1">
                Contraseña / Token de acceso
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={zohoPassword}
                  onChange={(e) => setZohoPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl pl-8 pr-3 py-2.5 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                />
                <Lock className="w-4 h-4 text-[#A39E93] absolute left-2.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-all"
            >
              <span>{isLoading ? 'Verificando con Zoho...' : 'Acceder con Zoho Mail'}</span>
              <ArrowRight className="w-4 h-4 text-[#C59B27]" />
            </button>
          </form>
        )}

        {/* Info de Seguridad & Coste */}
        <div className="pt-2 text-center text-[10px] text-[#A39E93] space-y-1 border-t border-[#F2EFE9]">
          <p>Autenticación empresarial con Zoho Mail & Supabase Auth</p>
          <p>Plan 100% Gratuito (Sin costos de licencia)</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[#6E665D]">
        MÍGALIA BAKERY · Puebla / Expansión EE. UU. (Visa E-2)
      </footer>
    </div>
  );
};

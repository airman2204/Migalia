'use client';

import React, { useState } from 'react';
import { Partner } from '@/types';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  partners: Partner[];
  onLogin: (partner: Partner) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ partners, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validación real con los servidores de correo
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/zoho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Credenciales incorrectas.');
        setIsLoading(false);
        return;
      }

      onLogin(data.user);
    } catch (err) {
      setErrorMessage('Error de red al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-center items-center p-4 sm:p-8">
      {/* Brand Central Grande */}
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center tracking-widest text-[#221F1D]">
          <span className="text-4xl sm:text-5xl font-bold tracking-[0.25em]">M</span>
          <span className="text-4xl sm:text-5xl font-bold tracking-[0.25em] relative">
            I
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-1.5 bg-[#C59B27] rounded-sm transform rotate-12" />
          </span>
          <span className="text-4xl sm:text-5xl font-bold tracking-[0.25em]">GALIA</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-7 sm:p-9 shadow-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[#221F1D] tracking-tight">
            Portal de administración Migalia
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="flex items-start gap-2 text-xs text-[#C84B31] bg-[#FDF0ED] p-3 rounded-xl border border-[#F5C6BC]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#221F1D] mb-1.5">
              Correo
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl pl-9 pr-3 py-3 text-[#221F1D] placeholder-[#A39E93] focus:outline-none focus:border-[#C59B27]"
                required
              />
              <Mail className="w-4 h-4 text-[#8C6239] absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#221F1D] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl pl-9 pr-3 py-3 text-[#221F1D] placeholder-[#A39E93] focus:outline-none focus:border-[#C59B27]"
                required
              />
              <Lock className="w-4 h-4 text-[#8C6239] absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] text-xs font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-60"
          >
            <span>{isLoading ? 'Verificando...' : 'Verificar e Ingresar'}</span>
            <ArrowRight className="w-4 h-4 text-[#C59B27]" />
          </button>
        </form>
      </div>
    </div>
  );
};

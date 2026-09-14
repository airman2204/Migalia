'use client';

import React, { useState } from 'react';
import { Partner } from '@/types';
import { ArrowRight, Mail, Lock, AlertCircle, XCircle } from 'lucide-react';

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

    if (!email.trim()) {
      setErrorMessage('Por favor escribe tu correo.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor escribe tu contraseña.');
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
        setErrorMessage(data.error || 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.');
        setIsLoading(false);
        return;
      }

      onLogin(data.user);
    } catch (err) {
      setErrorMessage('No fue posible conectar con el servidor de autenticación. Revisa tu conexión.');
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
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl p-7 sm:p-9 shadow-sm space-y-5">
        {/* Notificación de Error Prominente y Visible */}
        {errorMessage && (
          <div className="flex items-start gap-3 bg-[#FDF0ED] border-2 border-[#E07A5F] text-[#C84B31] p-4 rounded-2xl animate-in fade-in duration-200">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#C84B31]" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold">Error de acceso</p>
              <p className="text-xs font-medium leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#221F1D] mb-1.5">
              Correo
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full text-xs bg-[#F8F6F0] border rounded-xl pl-9 pr-3 py-3 text-[#221F1D] focus:outline-none transition-colors ${
                  errorMessage ? 'border-[#C84B31] focus:border-[#C84B31]' : 'border-[#E6DFD5] focus:border-[#C59B27]'
                }`}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className={`w-full text-xs bg-[#F8F6F0] border rounded-xl pl-9 pr-3 py-3 text-[#221F1D] focus:outline-none transition-colors ${
                  errorMessage ? 'border-[#C84B31] focus:border-[#C84B31]' : 'border-[#E6DFD5] focus:border-[#C59B27]'
                }`}
                required
              />
              <Lock className="w-4 h-4 text-[#8C6239] absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] text-xs font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-60 mt-2"
          >
            <span>{isLoading ? 'Verificando...' : 'Ingresar'}</span>
            <ArrowRight className="w-4 h-4 text-[#C59B27]" />
          </button>
        </form>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import Image from 'next/image';
import { Mail } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-6 sm:p-12 selection:bg-[#C59B27] selection:text-[#FFFFFF]">
      {/* Invisible spacer to balance flex-col */}
      <div className="hidden sm:block h-6" />

      {/* Hero Central */}
      <main className="max-w-2xl w-full mx-auto text-center space-y-8 my-auto py-12">
        {/* Brand Logo - Centrado y Grande con Isotipo Oficial */}
        <div className="flex flex-col items-center gap-4 select-none">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border border-[#E6DFD5] shadow-xl shadow-stone-200/60 flex items-center justify-center overflow-hidden">
            <Image
              src="/icon.png"
              alt="MÍGALIA"
              width={64}
              height={64}
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              priority
            />
          </div>
          <div className="flex items-baseline justify-center tracking-widest text-[#221F1D]">
            <span className="text-5xl sm:text-7xl font-bold tracking-[0.25em]">M</span>
            <span className="text-5xl sm:text-7xl font-bold tracking-[0.25em] relative">
              I
              <span className="absolute -top-2.5 sm:-top-3.5 left-1/2 -translate-x-1/2 w-3 sm:w-4 h-1.5 sm:h-2 bg-[#C59B27] rounded-sm transform rotate-12" />
            </span>
            <span className="text-5xl sm:text-7xl font-bold tracking-[0.25em]">GALIA</span>
          </div>
        </div>

        {/* Subtítulo & Texto */}
        <div className="space-y-4 pt-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#221F1D] tracking-tight">
            El arte de lo sutil
          </h1>

          <p className="text-sm sm:text-base text-[#6E665D] max-w-md mx-auto leading-relaxed font-normal">
            Estamos perfeccionando nuestro espacio boutique grab & go, muy pronto abriremos nuestras puertas.
          </p>
        </div>

        {/* Contacto Único: Correo Electrónico */}
        <div className="pt-6 flex justify-center">
          <a
            href="mailto:contacto@migaliabakery.com"
            className="inline-flex items-center gap-2 bg-[#FFFFFF] hover:bg-[#F2EFE9] border border-[#E6DFD5] px-4 py-2 rounded-2xl text-xs font-medium text-[#6E665D] hover:text-[#221F1D] transition-all shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-[#8C6239]" />
            <span>contacto@migaliabakery.com</span>
          </a>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="max-w-6xl w-full mx-auto text-center pt-8 border-t border-[#E6DFD5] text-[11px] text-[#A39E93]">
        <p>© {new Date().getFullYear()} MÍGALIA. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

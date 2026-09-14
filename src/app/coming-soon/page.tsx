'use client';

import React from 'react';
import { Sparkles, MapPin, Mail } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between p-6 sm:p-12 selection:bg-[#C59B27] selection:text-[#FFFFFF]">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-baseline tracking-widest text-[#221F1D]">
          <span className="text-2xl sm:text-3xl font-bold tracking-[0.25em]">M</span>
          <span className="text-2xl sm:text-3xl font-bold tracking-[0.25em] relative">
            I
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#C59B27] rounded-sm transform rotate-12" />
          </span>
          <span className="text-2xl sm:text-3xl font-bold tracking-[0.25em]">GALIA</span>
        </div>

        <div className="flex items-center gap-2 bg-[#EBE7DF] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#6E665D] border border-[#DDD5C7]">
          <span className="w-2 h-2 rounded-full bg-[#C59B27] animate-pulse" />
          <span>Próxima Apertura · Puebla</span>
        </div>
      </header>

      {/* Hero Central */}
      <main className="max-w-2xl w-full mx-auto text-center space-y-8 my-auto py-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FFFFFF] border border-[#E6DFD5] px-4 py-1.5 rounded-full text-xs font-semibold text-[#8C6239] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Repostería Artesanal & Café de Especialidad</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-[#221F1D] tracking-tight leading-tight">
            El arte de lo sutil y artesanal.
          </h1>

          <p className="text-sm sm:text-base text-[#6E665D] max-w-lg mx-auto leading-relaxed font-normal">
            Estamos perfeccionando nuestro espacio Boutique Grab & Go inspirado en la corriente Japandi. Muy pronto abriremos nuestras puertas en Puebla.
          </p>
        </div>

        {/* Concept Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
          <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
            <p className="text-[11px] uppercase font-bold text-[#8C6239] tracking-wider mb-1">Croissants & Masa Madre</p>
            <p className="text-xs text-[#6E665D] leading-snug">Fermentación prolongada con mantequilla artesanal de alta calidad.</p>
          </div>
          <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
            <p className="text-[11px] uppercase font-bold text-[#8C6239] tracking-wider mb-1">Cookie Fries & Trampantojo</p>
            <p className="text-xs text-[#6E665D] leading-snug">Galleta estilo papas fritas con dip frutal y recetas insignia.</p>
          </div>
          <div className="bg-[#FFFFFF] border border-[#E6DFD5] p-4 rounded-2xl shadow-xs">
            <p className="text-[11px] uppercase font-bold text-[#8C6239] tracking-wider mb-1">Café Sierra Norte</p>
            <p className="text-xs text-[#6E665D] leading-snug">Granos poblanos de especialidad y cold brew infusionado 16 horas.</p>
          </div>
        </div>

        {/* Ubicación & Contacto */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#6E665D]">
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E6DFD5] px-3 py-1.5 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>San Andrés Cholula / Angelópolis · Puebla</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E6DFD5] px-3 py-1.5 rounded-xl">
            <Mail className="w-3.5 h-3.5 text-[#8C6239]" />
            <span>contacto@migaliabakery.com</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#E6DFD5] text-xs text-[#6E665D]">
        <p>© {new Date().getFullYear()} MÍGALIA BAKERY. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">
          <a
            href="/admin"
            className="text-[11px] text-[#A39E93] hover:text-[#221F1D] underline transition-colors"
          >
            Acceso Socios (Admin)
          </a>
        </div>
      </footer>
    </div>
  );
}

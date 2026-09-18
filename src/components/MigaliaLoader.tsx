'use client';

import React from 'react';

interface MigaliaLoaderProps {
  label?: string;
  fullscreen?: boolean;
}

export const MigaliaLoader: React.FC<MigaliaLoaderProps> = ({
  label = 'Iniciando plataforma...',
  fullscreen = true,
}) => {
  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F6F0] selection:bg-[#C59B27] selection:text-white transition-opacity duration-300'
          : 'w-full py-16 flex flex-col items-center justify-center bg-transparent'
      }
    >
      <div className="flex flex-col items-center justify-center gap-6 select-none">
        {/* Contenedor del Isotipo M con pulso suave y resplandor ocre */}
        <div className="relative flex items-center justify-center">
          {/* Anillo de pulso sutil */}
          <div className="absolute w-24 h-24 rounded-full bg-[#C59B27]/10 animate-ping [animation-duration:2.5s]" />
          <div className="absolute w-28 h-28 rounded-full border border-[#C59B27]/25 animate-pulse [animation-duration:2s]" />

          {/* Tarjeta del Isotipo M */}
          <div className="relative w-20 h-20 rounded-3xl bg-white shadow-xl shadow-stone-200/80 border border-[#E6DFD5] flex items-center justify-center overflow-hidden group">
            {/* Destello de fondo suave */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F8F6F0] via-transparent to-[#FEF3C7]/30" />

            {/* Isotipo SVG de la M estilizada de Migalia con tilde dorada */}
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 relative z-10 transition-transform duration-500 hover:scale-105"
            >
              {/* Tilde ocre característica de Migalia */}
              <circle
                cx="78"
                cy="25"
                r="11"
                fill="#C59B27"
                className="animate-pulse [animation-duration:1.8s]"
              />

              {/* Trazos elegantes de la M */}
              <path
                d="M24 82V32"
                stroke="#221F1D"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M24 32L51 76L70 32"
                stroke="#221F1D"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M70 32V68C70 77 75 82 82 82"
                stroke="#221F1D"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Marca y Barra de Progreso Minimalista */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="flex items-baseline tracking-widest text-[#221F1D]">
            <span className="text-base font-bold tracking-[0.3em]">M</span>
            <span className="text-base font-bold tracking-[0.3em] relative">
              I
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-[#C59B27] rounded-xs transform rotate-12" />
            </span>
            <span className="text-base font-bold tracking-[0.3em]">GALIA</span>
          </div>

          <p className="text-[11px] font-medium tracking-wide text-[#6E665D] uppercase">
            {label}
          </p>

          {/* Barra de progreso sutil y refinada */}
          <div className="w-36 h-1 bg-[#E6DFD5] rounded-full overflow-hidden mt-1">
            <div className="w-full h-full bg-[#C59B27] rounded-full origin-left animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};

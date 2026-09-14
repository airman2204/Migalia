'use client';

import React from 'react';
import { Milestone } from '@/types';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface MilestonesViewProps {
  milestones: Milestone[];
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({ milestones }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#221F1D] tracking-tight">
          Hitos de Apertura & Cronograma (Fase I Puebla)
        </h2>
        <p className="text-xs text-[#6E665D]">
          Fechas clave para asegurar la apertura del punto de venta Grab & Go sin desviaciones de capital ni tiempo.
        </p>
      </div>

      <div className="space-y-4">
        {milestones.map((ms, index) => {
          const isDone = ms.status === 'completed';
          const inProgress = ms.status === 'in_progress';

          return (
            <div
              key={ms.id}
              className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F2EFE9] text-[#221F1D] font-bold text-xs flex items-center justify-center border border-[#DDD5C7]">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#221F1D]">{ms.title}</h3>
                    <p className="text-[11px] text-[#8C6239] font-medium">{ms.phase}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-[#6E665D] bg-[#F8F6F0] px-3 py-1 rounded-lg border border-[#E6DFD5]">
                    <Clock className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span className="font-semibold">{ms.deadline}</span>
                  </div>

                  {inProgress && (
                    <span className="text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] px-2.5 py-1 rounded-full">
                      En Ejecución
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-bold bg-[#EDF3EE] text-[#4A6B53] border border-[#CDE0D1] px-2.5 py-1 rounded-full">
                      Cumplido
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#6E665D]">
                  <span>Avance del hito</span>
                  <span className="font-bold text-[#221F1D]">{ms.progress}%</span>
                </div>
                <div className="w-full bg-[#EBE7DF] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C59B27] h-full rounded-full transition-all duration-300"
                    style={{ width: `${ms.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
        <div className="text-xs text-[#6E665D] leading-relaxed">
          <span className="font-bold text-[#221F1D]">Horizonte Estratégico: </span>
          Al cumplir con los hitos de la Fase I en Puebla con margen neto superior al 22%, se sientan las bases auditables para la posterior Fase II (Segunda sucursal) y Fase III (Visa E-2 en EE. UU.).
        </div>
      </div>
    </div>
  );
};

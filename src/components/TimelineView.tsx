'use client'

import React from 'react'
import { Milestone } from '../lib/mockData'
import { CheckCircle2, Circle, Clock, Flag } from 'lucide-react'

interface MilestoneProps {
  milestones: Milestone[]
}

export default function TimelineView({ milestones }: MilestoneProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-[#2B1D19]">Cronograma e Hitos Críticos de Apertura</h2>
        <p className="text-xs text-[#7A6658]">Línea de tiempo con fechas clave inamovibles hacia el lanzamiento oficial de MIGALIA</p>
      </div>

      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2D7CB] shadow-sm">
        <div className="relative border-l-2 border-[#A07835]/40 ml-4 md:ml-32 space-y-8 my-2">
          {milestones.map((m, idx) => {
            const isCompleted = m.status === 'Completado'
            const isInProgress = m.status === 'En Proceso'

            return (
              <div key={m.id} className="relative pl-6 md:pl-8 group">
                {/* Indicador sobre la línea de tiempo */}
                <div
                  className={`absolute -left-[11px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-[#A07835] border-[#A07835] text-white ring-4 ring-[#A07835]/20 animate-pulse'
                      : 'bg-[#FFFFFF] border-[#E2D7CB] text-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Circle className="w-2.5 h-2.5 fill-current" />
                  )}
                </div>

                {/* Fecha alineada a la izquierda en pantallas desktop */}
                <div className="hidden md:block absolute -left-32 top-0.5 w-24 text-right">
                  <span className="text-xs font-mono font-bold text-[#2B1D19]">{m.date}</span>
                </div>

                {/* Contenido del Hito */}
                <div className="bg-[#FAF6EF] p-4 rounded-xl border border-[#E2D7CB] space-y-1 hover:border-[#A07835] transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F1EAE1] text-[#7A6658] border border-[#E2D7CB]">
                      {m.category}
                    </span>
                    <span className="md:hidden text-xs font-mono font-bold text-[#2B1D19]">{m.date}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#2B1D19]">{m.title}</h3>

                  <div className="text-xs text-[#7A6658] font-medium pt-1">
                    Estatus:{' '}
                    <span
                      className={`font-semibold ${
                        isCompleted
                          ? 'text-emerald-700'
                          : isInProgress
                          ? 'text-[#A07835]'
                          : 'text-[#7A6658]'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

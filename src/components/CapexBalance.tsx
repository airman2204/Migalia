'use client'

import React from 'react'

export interface Expense {
  id: string
  concept: string
  category: string
  real_amount: number
  paid_by_email: string
}

interface CapexBalanceProps {
  expenses?: Expense[]
  targetBudget?: number
  socioAEmail?: string
  socioBEmail?: string
}

export default function CapexBalance({
  expenses = [],
  targetBudget = 250000,
  socioAEmail = 'socioa@gmail.com',
  socioBEmail = 'sociob@gmail.com',
}: CapexBalanceProps) {
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.real_amount), 0)
  const spentByA = expenses
    .filter((e) => e.paid_by_email === socioAEmail)
    .reduce((acc, curr) => acc + Number(curr.real_amount), 0)
  const spentByB = expenses
    .filter((e) => e.paid_by_email === socioBEmail)
    .reduce((acc, curr) => acc + Number(curr.real_amount), 0)

  const fairShare = totalSpent / 2
  const difference = spentByA - fairShare

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800">
      {/* Resumen Total vs Presupuesto Meta */}
      <div className="p-5 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/50 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Presupuesto Meta CAPEX</h3>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">
            ${totalSpent.toLocaleString('es-MX')} <span className="text-xs font-normal text-slate-400">/ ${targetBudget.toLocaleString('es-MX')} MXN</span>
          </p>
        </div>
        <div className="mt-4">
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${targetBudget > 0 ? Math.min((totalSpent / targetBudget) * 100, 100) : 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right font-mono">
            {targetBudget > 0 ? ((totalSpent / targetBudget) * 100).toFixed(1) : '0.0'}% ejecutado
          </p>
        </div>
      </div>

      {/* Aportaciones por Socio */}
      <div className="p-5 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/50 flex flex-col justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aportaciones por Socio</h3>
        <div className="space-y-3 mt-3">
          <div className="flex justify-between items-center bg-slate-700/40 p-2.5 rounded-lg border border-slate-700/30">
            <span className="text-sm text-slate-300 font-medium truncate max-w-[120px]">{socioAEmail}</span>
            <span className="text-base font-bold text-slate-100">${spentByA.toLocaleString('es-MX')} MXN</span>
          </div>
          <div className="flex justify-between items-center bg-slate-700/40 p-2.5 rounded-lg border border-slate-700/30">
            <span className="text-sm text-slate-300 font-medium truncate max-w-[120px]">{socioBEmail}</span>
            <span className="text-base font-bold text-slate-100">${spentByB.toLocaleString('es-MX')} MXN</span>
          </div>
        </div>
      </div>

      {/* Balance de Compensación 50/50 */}
      <div className="p-5 bg-slate-800/80 backdrop-blur rounded-xl border-l-4 border-amber-500 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Balance de Liquidación (50 / 50)</h3>
          <p className="text-xs text-slate-400 mt-1">Cuota justa por socio: ${fairShare.toLocaleString('es-MX')} MXN</p>
        </div>
        <div className="mt-3">
          {difference === 0 ? (
            <p className="text-sm font-bold text-emerald-400 bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/50 text-center">
              ¡Aportaciones perfectamente niveladas!
            </p>
          ) : difference > 0 ? (
            <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-800/40 text-xs leading-relaxed text-amber-200">
              <span className="font-semibold text-white">{socioBEmail}</span> debe transferir{' '}
              <span className="text-sm font-extrabold text-emerald-400 block my-1">${Math.abs(difference).toLocaleString('es-MX')} MXN</span>
              al socio <span className="font-semibold text-white">{socioAEmail}</span>.
            </div>
          ) : (
            <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-800/40 text-xs leading-relaxed text-amber-200">
              <span className="font-semibold text-white">{socioAEmail}</span> debe transferir{' '}
              <span className="text-sm font-extrabold text-emerald-400 block my-1">${Math.abs(difference).toLocaleString('es-MX')} MXN</span>
              al socio <span className="font-semibold text-white">{socioBEmail}</span>.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

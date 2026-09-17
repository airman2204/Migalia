'use client'

import React from 'react'
import { Expense } from '../lib/mockData'
import { DollarSign, ArrowRightLeft, ExternalLink, Plus } from 'lucide-react'

interface CapexViewProps {
  expenses: Expense[]
  targetBudget: number
  socioAName?: string
  socioBName?: string
  onAddExpense?: () => void
}

export default function CapexModuleView({
  expenses,
  targetBudget,
  socioAName = 'Socio A',
  socioBName = 'Socio B',
}: CapexViewProps) {
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.realAmount, 0)
  const spentByA = expenses.filter((e) => e.paidBy === 'Socio A').reduce((acc, curr) => acc + curr.realAmount, 0)
  const spentByB = expenses.filter((e) => e.paidBy === 'Socio B').reduce((acc, curr) => acc + curr.realAmount, 0)

  // Cálculo de liquidación 50 / 50
  const fairShare = totalSpent / 2
  const diffA = spentByA - fairShare

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2B1D19]">Control CAPEX & Balance entre Socios</h2>
          <p className="text-xs text-[#7A6658]">Registro de inversión inicial y compensación automática 50/50</p>
        </div>
      </div>

      {/* Tarjeta de Resumen y Liquidación 50/50 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Presupuesto Ejecutado */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2D7CB] shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6658]">Presupuesto Meta</span>
          <div className="text-2xl font-serif font-bold text-[#2B1D19]">
            ${totalSpent.toLocaleString('es-MX')} <span className="text-xs font-sans text-[#7A6658]">/ ${targetBudget.toLocaleString('es-MX')} MXN</span>
          </div>
          <div className="w-full bg-[#F1EAE1] h-2 rounded-full overflow-hidden">
            <div className="bg-[#A07835] h-full" style={{ width: `${Math.min((totalSpent / targetBudget) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Aportaciones por Socio */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2D7CB] shadow-sm space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6658]">Aportes Registrados</span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-[#2B1D19]">{socioAName}:</span>
              <span className="font-mono font-bold text-[#2B1D19]">${spentByA.toLocaleString('es-MX')} MXN</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-[#2B1D19]">{socioBName}:</span>
              <span className="font-mono font-bold text-[#2B1D19]">${spentByB.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>
        </div>

        {/* Widget Liquidación 50/50 */}
        <div className="bg-[#2B1D19] text-[#FFFFFF] p-5 rounded-2xl border border-[#382820] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A07835]">Balance de Liquidación</span>
            <ArrowRightLeft className="w-4 h-4 text-[#A07835]" />
          </div>
          <div className="mt-2 text-xs leading-relaxed">
            {diffA === 0 ? (
              <span className="text-emerald-400 font-bold">¡Aportaciones niveladas al 50%!</span>
            ) : diffA > 0 ? (
              <p>
                <span className="font-bold text-[#A07835]">{socioBName}</span> debe transferir{' '}
                <span className="text-sm font-bold text-emerald-400 block font-mono">${Math.abs(diffA).toLocaleString('es-MX')} MXN</span>
                al <span className="font-bold text-[#A07835]">{socioAName}</span> para quedar 50/50.
              </p>
            ) : (
              <p>
                <span className="font-bold text-[#A07835]">{socioAName}</span> debe transferir{' '}
                <span className="text-sm font-bold text-emerald-400 block font-mono">${Math.abs(diffA).toLocaleString('es-MX')} MXN</span>
                al <span className="font-bold text-[#A07835]">{socioBName}</span> para quedar 50/50.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Gastos */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2D7CB] shadow-sm overflow-hidden">
        <div className="p-4 bg-[#F1EAE1]/40 border-b border-[#E2D7CB] flex justify-between items-center">
          <h3 className="font-serif font-bold text-sm text-[#2B1D19]">Desglose de Gastos Registrados</h3>
          <span className="text-xs text-[#7A6658] font-mono">{expenses.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1EAE1] text-[#7A6658] uppercase text-[10px] tracking-wider font-semibold border-b border-[#E2D7CB]">
              <tr>
                <th className="p-3.5">Concepto</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5 text-right">Monto Real</th>
                <th className="p-3.5">Pagado Por</th>
                <th className="p-3.5">Método</th>
                <th className="p-3.5 text-center">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D7CB]/60">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-[#FAF6EF]/60 transition-colors">
                  <td className="p-3.5 font-medium text-[#2B1D19]">{expense.concept}</td>
                  <td className="p-3.5 text-[#7A6658]">
                    <span className="px-2 py-0.5 rounded bg-[#F1EAE1] border border-[#E2D7CB]">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#2B1D19]">
                    ${expense.realAmount.toLocaleString('es-MX')} MXN
                  </td>
                  <td className="p-3.5 font-semibold text-[#A07835]">{expense.paidBy}</td>
                  <td className="p-3.5 text-[#7A6658]">{expense.paymentMethod}</td>
                  <td className="p-3.5 text-center">
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#A07835] font-semibold hover:underline"
                    >
                      <span>Ver</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

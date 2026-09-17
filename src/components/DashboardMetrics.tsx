'use client'

import React from 'react'
import { PieChart, AlertCircle, Wallet, Users, ArrowUpRight } from 'lucide-react'
import { Task, Expense } from '../lib/mockData'

interface MetricsProps {
  tasks: Task[]
  expenses: Expense[]
  targetBudget: number
  viewMode: 'global' | 'mi-espacio'
  activeUser: 'Socio A' | 'Socio B'
}

export default function DashboardMetrics({
  tasks,
  expenses,
  targetBudget,
  viewMode,
  activeUser,
}: MetricsProps) {
  // Filtrado según el modo de vista
  const filteredTasks = viewMode === 'mi-espacio'
    ? tasks.filter(t => t.assignee === activeUser)
    : tasks

  const filteredExpenses = viewMode === 'mi-espacio'
    ? expenses.filter(e => e.paidBy === activeUser)
    : expenses

  // Cálculos dinámicos
  const totalTasksCount = filteredTasks.length
  const completedTasksCount = filteredTasks.filter(t => t.status === 'Completado').length
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0

  const urgentOrBlockedTasks = filteredTasks.filter(
    t => (t.priority === 'Urgente' || t.status === 'Bloqueado') && t.status !== 'Completado'
  ).length

  const totalSpent = filteredExpenses.reduce((acc, curr) => acc + curr.realAmount, 0)

  const spentByA = expenses.filter(e => e.paidBy === 'Socio A').reduce((acc, curr) => acc + curr.realAmount, 0)
  const spentByB = expenses.filter(e => e.paidBy === 'Socio B').reduce((acc, curr) => acc + curr.realAmount, 0)
  const grandTotalSpent = expenses.reduce((acc, curr) => acc + curr.realAmount, 0)
  const percentA = grandTotalSpent > 0 ? Math.round((spentByA / grandTotalSpent) * 100) : 50
  const percentB = grandTotalSpent > 0 ? Math.round((spentByB / grandTotalSpent) * 100) : 50

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {/* 1. PROGRESO GENERAL */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2D7CB] shadow-sm flex flex-col justify-between hover:border-[#A07835] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6658]">
            {viewMode === 'mi-espacio' ? 'Mi Progreso' : 'Progreso de Apertura'}
          </span>
          <div className="p-2 bg-[#F1EAE1] text-[#A07835] rounded-xl">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#2B1D19]">{progressPercent}%</span>
            <span className="text-xs text-[#7A6658]">({completedTasksCount}/{totalTasksCount} tareas)</span>
          </div>
          <div className="w-full bg-[#F1EAE1] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#A07835] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. TAREAS CRÍTICAS / BLOQUEADAS */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2D7CB] shadow-sm flex flex-col justify-between hover:border-rose-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6658]">
            {viewMode === 'mi-espacio' ? 'Mis Tareas Urgentes' : 'Riesgos / Bloqueos'}
          </span>
          <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-rose-800">{urgentOrBlockedTasks}</span>
            <span className="text-xs text-rose-600 font-medium">requieren atención</span>
          </div>
          <p className="text-[11px] text-[#7A6658] mt-2 font-medium">
            Prioridad Urgente o en Estado Bloqueado
          </p>
        </div>
      </div>

      {/* 3. EJECUCIÓN PRESUPUESTAL */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2D7CB] shadow-sm flex flex-col justify-between hover:border-[#A07835] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6658]">
            {viewMode === 'mi-espacio' ? 'Mis Gastos Registrados' : 'CAPEX Ejecutado'}
          </span>
          <div className="p-2 bg-[#F1EAE1] text-[#A07835] rounded-xl">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-serif font-bold text-[#2B1D19]">
            ${totalSpent.toLocaleString('es-MX')} <span className="text-xs font-sans text-[#7A6658] font-normal">MXN</span>
          </div>
          {viewMode === 'global' ? (
            <p className="text-[11px] text-[#7A6658] mt-1">
              Meta total: <span className="font-semibold text-[#2B1D19]">${targetBudget.toLocaleString('es-MX')} MXN</span>
            </p>
          ) : (
            <p className="text-[11px] text-[#7A6658] mt-1">
              Aportados por <span className="font-semibold text-[#A07835]">{activeUser}</span>
            </p>
          )}
        </div>
      </div>

      {/* 4. BALANCE ENTRE SOCIOS */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2D7CB] shadow-sm flex flex-col justify-between hover:border-[#A07835] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6658]">
            Balance 50 / 50
          </span>
          <div className="p-2 bg-[#F1EAE1] text-[#2B1D19] rounded-xl">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#7A6658]">Socio A (50%):</span>
            <span className="font-bold text-[#2B1D19] font-mono">{percentA}%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#7A6658]">Socio B (50%):</span>
            <span className="font-bold text-[#2B1D19] font-mono">{percentB}%</span>
          </div>
          <div className="w-full bg-[#F1EAE1] h-2 rounded-full overflow-hidden flex mt-2">
            <div className="bg-[#2B1D19] h-full" style={{ width: `${percentA}%` }} />
            <div className="bg-[#A07835] h-full" style={{ width: `${percentB}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

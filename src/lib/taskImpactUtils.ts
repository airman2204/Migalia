import { Task } from '@/types';

export interface TaskDateAnalysis {
  status: 'done' | 'overdue' | 'due_today' | 'due_soon' | 'on_track' | 'no_date';
  daysDiff: number; // Positivo si ya venció (días de atraso), negativo si aún falta
  badgeLabel: string;
  badgeClass: string;
  cardBorderClass: string;
  financialImpact: number;
}

/**
 * Analiza la fecha límite de una tarea para determinar su nivel de atraso o urgencia.
 */
export function analyzeTaskDate(task: Task): TaskDateAnalysis {
  const financialImpact = task.actualCost ?? task.estimatedCost ?? 0;

  if (task.status === 'done') {
    return {
      status: 'done',
      daysDiff: 0,
      badgeLabel: 'Completada',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cardBorderClass: 'border-[#E6DFD5]',
      financialImpact: 0,
    };
  }

  if (!task.dueDate) {
    return {
      status: 'no_date',
      daysDiff: 0,
      badgeLabel: 'Sin fecha',
      badgeClass: 'bg-stone-50 text-stone-500 border-stone-200',
      cardBorderClass: 'border-[#E6DFD5]',
      financialImpact: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = task.dueDate.split('-').map(Number);
  const due = new Date(year, (month || 1) - 1, day || 1);
  due.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // VENCIDA
  if (diffDays > 0) {
    const isCriticalPriority = task.priority === 'urgent' || task.priority === 'high';
    return {
      status: 'overdue',
      daysDiff: diffDays,
      badgeLabel: diffDays === 1 ? '⚠️ Vencida hace 1 día' : `⚠️ Vencida (+${diffDays}d)`,
      badgeClass: 'bg-red-50 text-red-700 border-red-300 font-bold animate-pulse',
      cardBorderClass: isCriticalPriority
        ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
        : 'border-red-300 bg-red-50/10',
      financialImpact,
    };
  }

  // VENCE HOY
  if (diffDays === 0) {
    return {
      status: 'due_today',
      daysDiff: 0,
      badgeLabel: '⏳ Vence HOY',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      cardBorderClass: 'border-amber-400 ring-1 ring-amber-400/20',
      financialImpact,
    };
  }

  // VENCE EN 1 O 2 DÍAS
  if (diffDays === -1 || diffDays === -2) {
    const daysLeft = Math.abs(diffDays);
    return {
      status: 'due_soon',
      daysDiff: diffDays,
      badgeLabel: daysLeft === 1 ? 'Vence mañana' : `Vence en ${daysLeft} días`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
      cardBorderClass: 'border-[#E6DFD5]',
      financialImpact: 0,
    };
  }

  // EN TIEMPO
  return {
    status: 'on_track',
    daysDiff: diffDays,
    badgeLabel: task.dueDate.substring(5),
    badgeClass: 'text-[#6E665D]',
    cardBorderClass: 'border-[#E6DFD5]',
    financialImpact: 0,
  };
}

/**
 * Calcula el resumen de atrasos e impacto financiero global del proyecto
 */
export function getOverdueMetrics(tasks: Task[]) {
  const overdueTasks: { task: Task; analysis: TaskDateAnalysis }[] = [];
  let totalFinancialImpact = 0;
  let maxDaysOverdue = 0;

  tasks.forEach((task) => {
    const analysis = analyzeTaskDate(task);
    if (analysis.status === 'overdue') {
      overdueTasks.push({ task, analysis });
      totalFinancialImpact += analysis.financialImpact;
      if (analysis.daysDiff > maxDaysOverdue) {
        maxDaysOverdue = analysis.daysDiff;
      }
    }
  });

  return {
    overdueCount: overdueTasks.length,
    overdueTasks,
    totalFinancialImpact,
    maxDaysOverdue,
  };
}

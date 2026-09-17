export interface PlanningTask {
  id: string
  title: string
  workstream: 'Obra & Arquitectura' | 'Permisos & Legal' | 'Equipamiento & Maquinaria' | 'Branding & Identidad' | 'Materia Prima & Recetas' | 'Finanzas & CAPEX'
  stage: 'Idea / Backlog' | 'En Definición (PM)' | 'En Cotización' | 'En Ejecución' | 'Completado'
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica'
  assignedTo: 'PM (Tú)' | 'Socio B' | 'Externo / Proveedor'
  targetDate: string
  deliverable: string
  estimatedCost: number
  isCriticalPath?: boolean
}

export interface WorkstreamSummary {
  name: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
}

export const projectPlanningData = {
  pmInfo: {
    name: 'Project Manager (Tú)',
    role: 'Líder del Proyecto & Arquitectura',
    projectGoal: 'Apertura de Sucursal MIGALIA',
    targetLaunchDate: '20 Octubre 2026',
    totalCapexBudget: 250000,
  },
  workstreams: [
    { name: 'Obra & Arquitectura', totalTasks: 4, completedTasks: 1, inProgressTasks: 2, blockedTasks: 1 },
    { name: 'Permisos & Legal', totalTasks: 3, completedTasks: 1, inProgressTasks: 1, blockedTasks: 1 },
    { name: 'Equipamiento & Maquinaria', totalTasks: 5, completedTasks: 2, inProgressTasks: 2, blockedTasks: 0 },
    { name: 'Branding & Identidad', totalTasks: 3, completedTasks: 1, inProgressTasks: 2, blockedTasks: 0 },
    { name: 'Materia Prima & Recetas', totalTasks: 4, completedTasks: 0, inProgressTasks: 3, blockedTasks: 0 },
  ],
  planningTasks: [
    {
      id: 'pt1',
      title: 'Firma de Contrato de Arrendamiento del Local',
      workstream: 'Permisos & Legal',
      stage: 'Completado',
      priority: 'Crítica',
      assignedTo: 'PM (Tú)',
      targetDate: '2026-09-10',
      deliverable: 'Contrato firmado y depósito pagado',
      estimatedCost: 40000,
      isCriticalPath: true,
    },
    {
      id: 'pt2',
      title: 'Anticipo y Fabricación de Horno Polin 4 Charolas',
      workstream: 'Equipamiento & Maquinaria',
      stage: 'En Ejecución',
      priority: 'Crítica',
      assignedTo: 'PM (Tú)',
      targetDate: '2026-09-25',
      deliverable: 'Confirmación de entrega e instalación',
      estimatedCost: 85000,
      isCriticalPath: true,
    },
    {
      id: 'pt3',
      title: 'Acometida Eléctrica 220V Trifásica para Horno',
      workstream: 'Obra & Arquitectura',
      stage: 'En Definición (PM)',
      priority: 'Crítica',
      assignedTo: 'PM (Tú)',
      targetDate: '2026-09-18',
      deliverable: 'Vistas e inspección CFE aprobada',
      estimatedCost: 18000,
      isCriticalPath: true,
    },
    {
      id: 'pt4',
      title: 'Trámite de Licencia Municipal de Funcionamiento',
      workstream: 'Permisos & Legal',
      stage: 'En Cotización',
      priority: 'Alta',
      assignedTo: 'Socio B',
      targetDate: '2026-10-05',
      deliverable: 'Licencia de apertura emitida',
      estimatedCost: 8500,
      isCriticalPath: false,
    },
    {
      id: 'pt5',
      title: 'Diseño de Fachada y Letrero de Identidad',
      workstream: 'Branding & Identidad',
      stage: 'En Ejecución',
      priority: 'Media',
      assignedTo: 'PM (Tú)',
      targetDate: '2026-09-30',
      deliverable: 'Render 3D y presupuesto de fabricante',
      estimatedCost: 14000,
      isCriticalPath: false,
    },
    {
      id: 'pt6',
      title: 'Pruebas de Horneado de Masa Madre (Croissant & Pan)',
      workstream: 'Materia Prima & Recetas',
      stage: 'En Definición (PM)',
      priority: 'Alta',
      assignedTo: 'Socio B',
      targetDate: '2026-10-12',
      deliverable: 'Estandarización de recetas y costeo final',
      estimatedCost: 5000,
      isCriticalPath: true,
    },
  ] as PlanningTask[],
}

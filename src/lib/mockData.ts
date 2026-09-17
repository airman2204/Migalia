export interface Task {
  id: string
  title: string
  category: 'Obra' | 'Legal/Permisos' | 'Equipamiento' | 'Branding' | 'Recetas' | 'Finanzas'
  status: 'Por Hacer' | 'En Progreso' | 'Bloqueado' | 'Completado'
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente'
  assignee: 'Socio A' | 'Socio B'
  dueDate: string
  subtasks: { id: string; title: string; completed: boolean }[]
  isMilestone?: boolean
}

export interface Expense {
  id: string
  concept: string
  category: string
  estimatedAmount: number
  realAmount: number
  paidBy: 'Socio A' | 'Socio B'
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta'
  receiptUrl: string
  date: string
}

export interface Vendor {
  id: string
  name: string
  service: string
  category: 'Maquinaria' | 'Café' | 'Harinas/Materia Prima' | 'Empaques' | 'Contratista'
  whatsapp: string
  status: 'Contacto Inicial' | 'Cotización Recibida' | 'Aprobado' | 'Rechazado'
  quotedAmount: number
  notes: string
}

export interface Milestone {
  id: string
  title: string
  date: string
  status: 'Completado' | 'En Proceso' | 'Pendiente'
  category: string
}

export interface MockData {
  tasks: Task[]
  expenses: Expense[]
  vendors: Vendor[]
  milestones: Milestone[]
  targetBudget: number
  socioA: { name: string; email: string; avatarUrl: string }
  socioB: { name: string; email: string; avatarUrl: string }
}

export const mockData: MockData = {
  targetBudget: 250000,
  socioA: {
    name: 'Socio A',
    email: 'socioa@migalia.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  socioB: {
    name: 'Socio B',
    email: 'sociob@migalia.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  tasks: [
    {
      id: 't1',
      title: 'Firma de Contrato de Arrendamiento del Local',
      category: 'Legal/Permisos',
      status: 'Completado',
      priority: 'Urgente',
      assignee: 'Socio A',
      dueDate: '2026-09-10',
      isMilestone: true,
      subtasks: [
        { id: 'st1', title: 'Revisión con abogado', completed: true },
        { id: 'st2', title: 'Pago de depósito de garantía', completed: true },
      ],
    },
    {
      id: 't2',
      title: 'Anticipo y Fabricación de Horno Polin Panadería',
      category: 'Equipamiento',
      status: 'En Progreso',
      priority: 'Alta',
      assignee: 'Socio A',
      dueDate: '2026-09-25',
      isMilestone: true,
      subtasks: [
        { id: 'st3', title: 'Transferencia del 50% de anticipo', completed: true },
        { id: 'st4', title: 'Confirmación de dimensiones eléctricas', completed: false },
      ],
    },
    {
      id: 't3',
      title: 'Instalación de Acometida Eléctrica 220V Trifásica',
      category: 'Obra',
      status: 'Bloqueado',
      priority: 'Urgente',
      assignee: 'Socio B',
      dueDate: '2026-09-18',
      subtasks: [
        { id: 'st5', title: 'Dictamen de electricista certificado', completed: true },
        { id: 'st6', title: 'Aprobación de CFE para medidor trifásico', completed: false },
      ],
    },
    {
      id: 't4',
      title: 'Trámite de Licencia de Funcionamiento Municipal',
      category: 'Legal/Permisos',
      status: 'Por Hacer',
      priority: 'Alta',
      assignee: 'Socio B',
      dueDate: '2026-10-05',
      isMilestone: true,
      subtasks: [
        { id: 'st7', title: 'Ingreso de uso de suelo', completed: false },
        { id: 'st8', title: 'Visto bueno de Protección Civil', completed: false },
      ],
    },
    {
      id: 't5',
      title: 'Manual de Marca e Identidad Visual MIGALIA',
      category: 'Branding',
      status: 'En Progreso',
      priority: 'Media',
      assignee: 'Socio A',
      dueDate: '2026-09-30',
      subtasks: [
        { id: 'st9', title: 'Definición de empaques y bolsas', completed: true },
        { id: 'st10', title: 'Diseño de letrero de fachada', completed: false },
      ],
    },
    {
      id: 't6',
      title: 'Pruebas de Horneado de Masa Madre (Croissant & Hogazas)',
      category: 'Recetas',
      status: 'Por Hacer',
      priority: 'Urgente',
      assignee: 'Socio B',
      dueDate: '2026-10-12',
      isMilestone: true,
      subtasks: [
        { id: 'st11', title: 'Prueba de harinas de fuerza locales', completed: false },
        { id: 'st12', title: 'Ajuste de tiempos de fermentación', completed: false },
      ],
    },
  ],
  expenses: [
    {
      id: 'e1',
      concept: 'Anticipo Horno Polin 4 Charolas',
      category: 'Equipamiento',
      estimatedAmount: 85000,
      realAmount: 85000,
      paidBy: 'Socio A',
      paymentMethod: 'Transferencia',
      receiptUrl: 'https://drive.google.com',
      date: '2026-09-02',
    },
    {
      id: 'e2',
      concept: 'Depósito de Garantía y Mes de Renta Local',
      category: 'Legal/Permisos',
      estimatedAmount: 40000,
      realAmount: 40000,
      paidBy: 'Socio B',
      paymentMethod: 'Transferencia',
      receiptUrl: 'https://drive.google.com',
      date: '2026-09-10',
    },
    {
      id: 'e3',
      concept: 'Proyecto Arquitectónico y Planos de Obra',
      category: 'Obra',
      estimatedAmount: 20000,
      realAmount: 18000,
      paidBy: 'Socio A',
      paymentMethod: 'Transferencia',
      receiptUrl: 'https://drive.google.com',
      date: '2026-09-05',
    },
    {
      id: 'e4',
      concept: 'Anticipo de Barra de Granito e Iluminación',
      category: 'Obra',
      estimatedAmount: 25000,
      realAmount: 22500,
      paidBy: 'Socio B',
      paymentMethod: 'Tarjeta',
      receiptUrl: 'https://drive.google.com',
      date: '2026-09-12',
    },
  ],
  vendors: [
    {
      id: 'v1',
      name: 'Equipos Panaderos del Norte',
      service: 'Horno Polin y Amasadora 20kg',
      category: 'Maquinaria',
      whatsapp: '5215512345678',
      status: 'Aprobado',
      quotedAmount: 125000,
      notes: 'Descuento del 5% pagando el 50% de anticipo. Entrega en 3 semanas.',
    },
    {
      id: 'v2',
      name: 'Tostaduría Café Origen',
      service: 'Granos de Café Especialidad (Chiapas/Oaxaca)',
      category: 'Café',
      whatsapp: '5215598765432',
      status: 'Cotización Recibida',
      quotedAmount: 18000,
      notes: 'Incluye capacitación barística para 4 personas al comprar 30kg/mes.',
    },
    {
      id: 'v3',
      name: 'Molinos Central Harinera',
      service: 'Harina de Trigo Alta Proteína (13.5%)',
      category: 'Harinas/Materia Prima',
      whatsapp: '5215544332211',
      status: 'Aprobado',
      quotedAmount: 8500,
      notes: 'Sacos de 25kg a $420 MXN. Pedido mínimo 10 sacos con envío incluido.',
    },
    {
      id: 'v4',
      name: 'Empaques Eco Bakes',
      service: 'Cajas Kraft Impresas y Bolsas para Pan',
      category: 'Empaques',
      whatsapp: '5215566778899',
      status: 'Contacto Inicial',
      quotedAmount: 14000,
      notes: 'En espera de muestras de papel antigrasa para croissants.',
    },
  ],
  milestones: [
    { id: 'm1', title: 'Firma de Contrato del Local', date: '10 Sep 2026', status: 'Completado', category: 'Legal' },
    { id: 'm2', title: 'Entrega e Instalación del Horno', date: '25 Sep 2026', status: 'En Proceso', category: 'Equipamiento' },
    { id: 'm3', title: 'Licencia Municipal de Apertura', date: '05 Oct 2026', status: 'Pendiente', category: 'Permisos' },
    { id: 'm4', title: 'Pruebas Finales de Recetas & Menú', date: '12 Oct 2026', status: 'Pendiente', category: 'Operación' },
    { id: 'm5', title: 'GRAN APERTURA MIGALIA', date: '20 Oct 2026', status: 'Pendiente', category: 'Lanzamiento' },
  ],
}

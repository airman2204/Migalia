export interface Contact {
  id: string
  name: string
  company: string
  role: string
  email: string
  phone: string
  whatsapp: string
  category: 'Proveedor' | 'Cliente VIP' | 'Contratista' | 'Inversionista' | 'Aliado Comercial'
  status: 'Lead Nuevo' | 'En Negociación' | 'Propuesta Enviada' | 'Contratado / Ganado' | 'Perdido'
  value: number
  lastContact: string
  notes: string
  tasksCount: number
}

export interface CRMActivity {
  id: string
  contactId: string
  contactName: string
  type: 'Llamada' | 'Reunión' | 'WhatsApp' | 'Nota'
  date: string
  description: string
  author: 'Socio A' | 'Socio B'
}

export interface CRMStats {
  totalLeads: number
  inPipelineValue: number
  wonValue: number
  conversionRate: number
}

export const crmMockData = {
  stats: {
    totalLeads: 24,
    inPipelineValue: 345000,
    wonValue: 185000,
    conversionRate: 68,
  },
  contacts: [
    {
      id: 'c1',
      name: 'Carlos Mendoza',
      company: 'Equipos Panaderos del Norte',
      role: 'Director de Ventas',
      email: 'carlos@equipospanaderos.com',
      phone: '+52 55 1234 5678',
      whatsapp: '5215512345678',
      category: 'Proveedor',
      status: 'Contratado / Ganado',
      value: 125000,
      lastContact: 'Hace 2 horas',
      notes: 'Horno Polin 4 charolas aprobado con 50% de anticipo pagado.',
      tasksCount: 2,
    },
    {
      id: 'c2',
      name: 'Sofía Valenzuela',
      company: 'Tostaduría Café Origen',
      role: 'Sommelier de Café',
      email: 'sofia@cafeorigen.mx',
      phone: '+52 55 9876 5432',
      whatsapp: '5215598765432',
      category: 'Proveedor',
      status: 'En Negociación',
      value: 38000,
      lastContact: 'Ayer',
      notes: 'Acordando volumen mensual de café especialidad Chiapas/Oaxaca y capacitación de baristas.',
      tasksCount: 1,
    },
    {
      id: 'c3',
      name: 'Arq. Roberto Garza',
      company: 'Garza & Asociados Arquitectura',
      role: 'Contratista General',
      email: 'roberto@garzaarq.com',
      phone: '+52 81 4433 2211',
      whatsapp: '5218144332211',
      category: 'Contratista',
      status: 'Contratado / Ganado',
      value: 60000,
      lastContact: 'Hace 1 día',
      notes: 'Ejecución de planos eléctricos trifásicos y barra de atención al público.',
      tasksCount: 4,
    },
    {
      id: 'c4',
      name: 'Lucía Fernández',
      company: 'Empaques Eco Bakes',
      role: 'Gerente Comercial',
      email: 'lucia@ecobakes.com',
      phone: '+52 55 6677 8899',
      whatsapp: '5215566778899',
      category: 'Proveedor',
      status: 'Propuesta Enviada',
      value: 18500,
      lastContact: 'Hace 3 días',
      notes: 'En espera de muestras de cajas kraft personalizadas para reposteria.',
      tasksCount: 1,
    },
    {
      id: 'c5',
      name: 'Gabriel Torres',
      company: 'Eventos & Catering Premier',
      role: 'Director Operativo',
      email: 'gtorres@cateringpremier.mx',
      phone: '+52 55 1122 3344',
      whatsapp: '5215511223344',
      category: 'Cliente VIP',
      status: 'Lead Nuevo',
      value: 45000,
      lastContact: 'Hace 4 días',
      notes: 'Interesado en suministro diario de croissants de mantequilla para eventos corporativos.',
      tasksCount: 0,
    },
  ] as Contact[],
  activities: [
    {
      id: 'a1',
      contactId: 'c1',
      contactName: 'Carlos Mendoza',
      type: 'WhatsApp',
      date: 'Hoy, 10:30 AM',
      description: 'Confirmada fecha de envío del horno para el 25 de septiembre.',
      author: 'Socio A',
    },
    {
      id: 'a2',
      contactId: 'c2',
      contactName: 'Sofía Valenzuela',
      type: 'Reunión',
      date: 'Ayer, 4:00 PM',
      description: 'Cata de muestras de café de especialidad y prueba de tueste para espresso.',
      author: 'Socio B',
    },
    {
      id: 'a3',
      contactId: 'c3',
      contactName: 'Arq. Roberto Garza',
      type: 'Llamada',
      date: '12 Sep, 11:15 AM',
      description: 'Revisión de avance en instalación trifásica 220V.',
      author: 'Socio A',
    },
  ] as CRMActivity[],
}

import { Partner, Task, LogbookEntry, Milestone } from '@/types';

// Socios configurables (puedes cambiar sus nombres reales en la app)
export const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 'partner-1',
    name: 'Socio 1',
    shortName: 'Socio 1',
    email: 'socio1@migaliabakery.com',
    role: 'Cofundador',
    avatar: '1',
  },
  {
    id: 'partner-2',
    name: 'Socio 2',
    shortName: 'Socio 2',
    email: 'socio2@migaliabakery.com',
    role: 'Cofundador',
    avatar: '2',
  },
];

// Estado en blanco para iniciar desde 0
export const EMPTY_TASKS: Task[] = [];
export const EMPTY_LOGBOOK: LogbookEntry[] = [];

// Hitos de referencia en timeline (editables y eliminables)
export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    title: 'Constitución Legal & Trámites Notariales',
    phase: 'Fase I: Legal',
    deadline: '2026-10-15',
    status: 'in_progress',
    progress: 25,
  },
  {
    id: 'ms-2',
    title: 'Arrendamiento & Obra Chukum Local',
    phase: 'Fase I: Obra',
    deadline: '2026-11-30',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'ms-3',
    title: 'Equipamiento & Pruebas de Horno',
    phase: 'Fase I: Producción',
    deadline: '2026-12-20',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'ms-4',
    title: 'Apertura Oficial Boutique Grab & Go Puebla',
    phase: 'Fase I: Lanzamiento',
    deadline: '2027-01-15',
    status: 'pending',
    progress: 0,
  },
];

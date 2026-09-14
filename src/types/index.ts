export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskCategory = 'Obra & Interiorismo' | 'Equipamiento' | 'Legal & S.A.' | 'Recetas & Pruebas' | 'Empaque & Marca' | 'Estrategia E-2';

export interface Partner {
  id: string;
  name: string;
  shortName: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string; // Partner id
  category: TaskCategory;
  dueDate: string;
  subtasks: Subtask[];
  createdAt: string;
}

export interface LogbookEntry {
  id: string;
  title: string;
  content: string;
  category: 'Reunión & Acuerdos' | 'Decisión de Negocio' | 'Incidencia / Reto' | 'Hito Logrado';
  authorId: string;
  authorName: string;
  date: string;
}

export interface Milestone {
  id: string;
  title: string;
  phase: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

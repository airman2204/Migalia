export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskCategory =
  | 'Legal & Permisos'
  | 'Legal & S.A.'
  | 'Finanzas'
  | 'Recetas & Menú'
  | 'Recetas & Pruebas'
  | 'Branding'
  | 'Empaque & Marca'
  | 'Comercial & Ventas'
  | 'Obra & Interiorismo'
  | 'Equipamiento'
  | 'Proveedores'
  | 'Operaciones'
  | 'Estrategia E-2'
  | string;

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
  startDate?: string;
  dueDate: string;
  subtasks: Subtask[];
  estimatedCost?: number;
  actualCost?: number;
  isBlocked?: boolean;
  blockerReason?: string;
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

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number; // Gramaje / cantidad (ej. 0.250)
  unit: 'KG' | 'GR' | 'LT' | 'ML' | 'PZA' | 'C/S' | string;
  unitCost: number; // C/U (Costo unitario de compra)
  totalCost: number; // C/T (Calculado: quantity * unitCost)
  isSubrecipeTitle?: boolean; // Para encabezados tipo "SUB-RECETA GUACAMOLE"
}

export interface Recipe {
  id: string;
  title: string; // RECETA (ej. COSTRA DE QUESO, COOKIE FRIES)
  yieldCount: string; // RENDIMIENTO (ej. "10 PERSONAS", "24 PIEZAS")
  presentation: string; // PRESENTACIÓN (ej. "ENTRADA CALIENTE", "CAJA GIFTABLE")
  standardizedFor?: string; // Título superior (ej. "Recetario estandarizado y costeado")
  category?: string; // Categoría interna (ej. "Galletas", "Panadería", "Bebidas")
  ingredients: RecipeIngredient[];
  miseEnPlace: string[]; // Lista numerada de pasos de pre-elaboración
  preparation: string[]; // Lista numerada de pasos de preparación y horneado
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type DocumentType = 'doc' | 'sheet' | 'google_embed';
export type DocumentFolder =
  | 'Legal & Constitución'
  | 'Finanzas & Inversión'
  | 'Operaciones & Taller'
  | 'Branding & Mercadotecnia'
  | 'General';

export interface MigaliaDocument {
  id: string;
  title: string;
  type: DocumentType;
  folder: DocumentFolder;
  content: string; // Para Docs: HTML/Markdown; Para Sheets: JSON string de celdas; Para Google: URL embed
  authorId?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

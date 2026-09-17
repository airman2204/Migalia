/**
 * @file index.ts
 * @description Definiciones de tipos y contratos de datos para la plataforma MIGALIA.
 * Incluye modelos para tareas, recetas (estándar gastronómico ISU), documentos de Google Workspace,
 * finanzas y seguimiento de hitos de apertura.
 */

/**
 * Nivel de urgencia o prioridad de una actividad dentro del proyecto.
 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Estado en el flujo de trabajo del tablero Kanban y seguimiento operativo.
 */
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

/**
 * Categorías funcionales de las tareas del proyecto.
 */
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

/**
 * Modelo de socio fundador o colaborador con acceso al sistema.
 */
export interface Partner {
  /** Identificador único del socio (ej. 'partner-1') */
  id: string;
  /** Nombre completo formal (ej. 'Mario Alberto González Cervantes') */
  name: string;
  /** Nombre corto o de pila utilizado en insignias y filtros */
  shortName: string;
  /** Correo electrónico de contacto */
  email: string;
  /** Cargo o función operativa dentro del negocio */
  role: string;
  /** URL o iniciales para el avatar visual */
  avatar: string;
  /** Estado de presencia en vivo en la plataforma */
  isOnline?: boolean;
  /** Marca de tiempo de última actividad (timestamp ms o ISO) */
  lastSeen?: string | number;
}

/**
 * Elemento de verificación dentro de una tarea principal.
 */
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  startDate?: string;
  estimated?: number;
  actual?: number;
  isBlocked?: boolean;
  blockerReason?: string;
}

/**
 * Actividad o tarea del cronograma de apertura y operación.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  /** ID del socio asignado o lista separada por comas */
  assignedTo: string;
  category: TaskCategory;
  startDate?: string;
  dueDate: string;
  subtasks: Subtask[];
  /** Costo monetario estimado en pesos mexicanos (MXN) */
  estimatedCost?: number;
  /** Gasto real ejecutado y pagado en pesos mexicanos (MXN) */
  actualCost?: number;
  /** Indica si la actividad tiene impedimentos externos (licencias, arrendamiento, etc.) */
  isBlocked?: boolean;
  /** Causa o motivo detallado del bloqueo */
  blockerReason?: string;
  createdAt: string;
}

/**
 * Entrada en la bitácora de acuerdos, minutas o hitos corporativos.
 */
export interface LogbookEntry {
  id: string;
  title: string;
  content: string;
  category: 'Reunión & Acuerdos' | 'Decisión de Negocio' | 'Incidencia / Reto' | 'Hito Logrado';
  authorId: string;
  authorName: string;
  /** Fecha en formato YYYY-MM-DD */
  date: string;
}

/**
 * Hito crítico con fecha límite en la línea de tiempo del proyecto.
 */
export interface Milestone {
  id: string;
  title: string;
  phase: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  /** Porcentaje de progreso de 0 a 100 */
  progress: number;
}

/**
 * Insumo individual dentro de la ficha de escandallo culinario (Estándar ISU).
 */
export interface RecipeIngredient {
  id: string;
  /** Nombre del insumo o título de la sub-receta */
  name: string;
  /** Cantidad o gramaje requerido para el lote (ej. 0.250 KG) */
  quantity: number;
  /** Unidad de medida reglamentaria */
  unit: 'KG' | 'GR' | 'LT' | 'ML' | 'PZA' | 'TSP' | 'TBSP' | 'C/S' | string;
  /** Costo Unitario de adquisición (C/U) */
  unitCost: number;
  /** Costo Total calculado: quantity * unitCost (C/T) */
  totalCost: number;
  /** Define si el renglón actúa como separador visual de sub-receta */
  isSubrecipeTitle?: boolean;
}

/**
 * Ficha técnica estandarizada y costeada de receta gastronómica (Estándar ISU Gastronomía).
 */
export interface Recipe {
  id: string;
  /** Nombre del producto final (ej. 'COOKIE FRIES CON DIP DE FRUTOS ROJOS') */
  title: string;
  /** Rendimiento del lote (ej. '10 PERSONAS', '24 PORCIONES') */
  yieldCount: string;
  /** Tipo de presentación en vitrina o empaque (ej. 'CONO KRAFT INDIVIDUAL') */
  presentation: string;
  /** Título de estandarización institucional */
  standardizedFor?: string;
  /** Categoría gastronómica interna (ej. 'Repostería Insignia', 'Panadería') */
  category?: string;
  /** Lista de insumos y sub-recetas con costeo */
  ingredients: RecipeIngredient[];
  /** Pasos numerados de preparación previa y pesado */
  miseEnPlace: string[];
  /** Pasos numerados de elaboración, horneado y montaje */
  preparation: string[];
  /** Notas técnicas de temperaturas, conservación o empaque */
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Tipo de documento admitido en el gestor de expedientes.
 */
export type DocumentType = 'google_sheet' | 'google_doc' | 'google_embed' | 'doc' | 'sheet';

/**
 * Carpetas de clasificación de documentos del negocio.
 */
export type DocumentFolder =
  | 'Legal & Constitución'
  | 'Finanzas & Inversión'
  | 'Operaciones & Taller'
  | 'Branding & Mercadotecnia'
  | 'General';

/**
 * Modelo de archivo integrado en el expediente de Migalia.
 */
export interface MigaliaDocument {
  id: string;
  title: string;
  type: DocumentType;
  folder: DocumentFolder;
  /** URL del recurso o contenido persistido */
  content: string;
  /** Enlace directo oficial de Google Drive / Docs / Sheets */
  googleUrl?: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

/**
 * Mensaje individual en el Chat Interno entre Socios de Migalia.
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isMeetingInvite?: boolean;
  meetingTitle?: string;
}

/**
 * Sesión de trabajo programada en el Calendario Interno de Migalia.
 */
export interface ScheduledMeeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (ej. "17:00")
  attendees: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  topics?: string;
  minutaContent?: string;
  createdAt: string;
}



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
  /** Cantidad o gramaje requerido para el lote (ej. 0.250, 1, 1/2, 1/4) */
  quantity: string | number;
  /** Unidad de medida reglamentaria */
  unit: 'KG' | 'LT' | 'PZA' | 'TAZA' | 'TBSP' | 'TSP' | 'C/S' | string;
  /** Costo Unitario de adquisición (C/U) */
  unitCost: number;
  /** Costo Total calculado: quantity * unitCost (C/T) */
  totalCost: number;
  /** Define si el renglón actúa como separador visual de sub-receta */
  isSubrecipeTitle?: boolean;
  /** ID del insumo base seleccionado del catálogo maestro (opcional) */
  rawIngredientId?: string;
}

/**
 * Insumo general / Materia prima en presentación comercial mayorista o minorista.
 * Permite calcular el costo unitario por gramo, mililitro o pieza (ej. Bulto de harina 25kg en $450 => $18/kg => $0.018/g).
 */
export interface RawIngredient {
  id: string;
  /** Nombre del insumo o materia prima (ej. Harina de Trigo San Antonio) */
  name: string;
  /** Categoría (ej. Harinas & Polvos, Lácteos & Grasas, Azúcares, Chocolates & Coberturas, Frutas & Frutos Secos, Empaques, Especias & Extractos) */
  category: string;
  /** Presentación de compra (ej. Bulto 25 kg, Costal 50 kg, Caja 10 kg, Barra 1 kg, Bote 4 lt, Cubeta 19 lt, Pieza) */
  purchasePackage: string;
  /** Cantidad que contiene el empaque (ej. 25, 50, 1, 4) */
  packageQuantity: number;
  /** Unidad del empaque (KG, LT, PZA, G, ML) */
  packageUnit: 'KG' | 'LT' | 'PZA' | 'G' | 'ML';
  /** Precio total pagado por el empaque/costal en MXN */
  packageCost: number;
  /** Rendimiento utilizable (%) - merma o aprovechamiento (ej. 100 para harina, 90 para fruta con merma) */
  yieldPercentage?: number;
  /** Costo calculado por unidad estándar base (por 1 KG, por 1 LT o por 1 PZA) */
  costPerBaseUnit: number;
  /** Unidad base calculada (KG, LT, PZA) */
  baseUnit: 'KG' | 'LT' | 'PZA';
  /** Proveedor preferido (ej. Central de Abastos, Costco, Abastecedora La Suiza, Puratos) */
  supplier?: string;
  /** Notas o especificaciones */
  notes?: string;
  updatedAt?: string;
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
export type DocumentType = 'google_sheet' | 'google_doc' | 'google_embed' | 'doc' | 'sheet' | 'pdf';

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

/**
 * Elemento archivado en la Papelera de Reciclaje (permite restauración o purga permanente).
 */
export interface TrashedItem {
  id: string;
  originalId: string;
  type: 'recipe' | 'task' | 'document' | 'logbook' | 'milestone' | 'meeting';
  title: string;
  deletedAt: string;
  deletedBy: string;
  payload: any;
}

/**
 * Mensaje individual en el módulo de Atención a Clientes (Instagram / WhatsApp / Web).
 */
export interface CustomerMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent';
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: string[];
  status?: 'sent' | 'delivered' | 'read';
}

/**
 * Conversación / Ticket en el módulo de Atención a Clientes.
 */
export interface CustomerConversation {
  id: string;
  platform: 'instagram' | 'whatsapp' | 'web';
  customerHandle: string; // ej. @sofia_montes_puebla
  customerName: string;   // ej. Sofía Montes
  customerAvatar?: string;
  customerPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'pending' | 'in_progress' | 'quote_sent' | 'order_confirmed' | 'resolved';
  category?: 'Cotización de Pastel' | 'Pedido Evento' | 'Duda Menú & Alérgenos' | 'Horarios & Ubicación' | 'General';
  assignedTo?: string; // ID del socio asignado (ej. 'partner-1' o 'partner-2')
  notes?: string;
  quotedAmount?: number;
  orderReference?: string;
  createdAt: string;
  tags?: string[];
}


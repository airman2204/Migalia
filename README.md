# MIGALIA · Sistema de Gestión Operativa, Financiera & Expansión

Plataforma integral desarrollada a la medida para la dirección y apertura de la boutique **MIGALIA** (Repostería fina de autor & Cookie Fries en Puebla, México), orientada a la estandarización operativa, control financiero y expediente corporativo apto para trámites de inversión (Visa E-2).

---

## 🏛️ 1. Módulos del Sistema

### 1.1 Resumen Ejecutivo (Dashboard)
- **Control Presupuestal:** Monitoreo del CAPEX autorizado ($250,000 MXN), costo estimado de actividades, gasto real ejecutado y saldo disponible en tiempo real.
- **Progreso Operativo:** Medidor porcentual de avance del proyecto y estado de las actividades (Por hacer, En progreso, Bloqueadas, Completadas).
- **Control de Bloqueos:** Detección de tareas críticas frenadas por permisos municipales (Licencia de Funcionamiento, COFEPRIS) o arrendamiento.
- **Filtro de Socios:** Conmutador de vista entre visión **Global (Proyecto Completo)** y **Mi Espacio** para cada socio (Mario / Susy).

### 1.2 Gestión de Actividades & Kanban
- **Lista de Tareas:** Catálogo de actividades organizadas por categorías estratégicas (*Legal & Permisos*, *Obra & Local*, *Equipamiento*, *Branding*, *Proveedores*, *Operaciones*).
- **Tablero Kanban:** Gestión visual de flujo de trabajo con arrastrar y soltar (Drag & Drop) entre estados: *Por Hacer*, *En Progreso*, *Bloqueado* y *Hecho*.
- **Subtareas y Costeo por Actividad:** Cada tarea cuenta con desglose de costos estimados vs reales y lista de verificación de subtareas.

### 1.3 Recetario & Costeo Gastronómico (Estándar ISU)
- **Estandarización Culinaria:** Basado en el formato oficial del Instituto Suizo de Gastronomía y Hotelería (ISU).
- **Escandallo de Insumos:** Cálculo automático de Costo Unitario $\times$ Gramaje = Costo Total del lote.
- **Soporte de Sub-recetas:** Manejo de preparaciones secundarias (dips, rellenos, salsas de frutos rojos).
- **Mise en Place & Preparación:** Pasos numerados independientes para pre-elaboración, horneado y presentación.
- **Exportación a PDF Oficial:** Generación con membrete de Migalia tanto de recetas individuales como del **Recetario Maestro Completo** con un solo clic.

### 1.4 Documentos & Archivos (Google Workspace Oficial)
- **Centro de Expediente:** Organización en carpetas temáticas (*Legal & Constitución*, *Finanzas & Inversión*, *Operaciones & Taller*, *Branding & Mercadotecnia*, *General*).
- **Integración Nativa Google Sheets & Docs:**
  - Soporte completo para fórmulas matemáticas avanzadas (`SUMA`, `BUSCARV`, `SI`), gráficos dinámicos y pestañas múltiples.
  - Almacenamiento seguro directo en la cuenta de Google Drive de los socios.
  - Visor embebido interactivo a pantalla completa dentro de la plataforma.
  - Accesos rápidos a `sheets.new` y `docs.new` para crear nuevos archivos en la nube al instante.

### 1.5 Bitácora & Minutas
- Registro cronológico de acuerdos entre socios, actas de asamblea, visitas a obra, cotizaciones de hornos y pruebas de cocina.
- Historial de autor y fecha para trazabilidad del proyecto.

### 1.6 Hitos & Cronograma
- Línea de tiempo con fechas límite para las fases clave de la apertura (Constitución, Arrendamiento, Equipamiento, Pruebas y Apertura Oficial).

### 1.7 Miga AI (Copiloto Inteligente de Negocio & Marketing)
- **Ubicación:** Barra lateral inferior (arriba de Configuración).
- **Cerebro en Tiempo Real:** Lee segundo a segundo todas las recetas, costos, tareas bloqueadas, gastos de CAPEX y acuerdos de la plataforma.
- **Dossier Ejecutivo para Inversionistas (Exportable a PDF):**
  - Resumen formal del negocio listo para presentar a inversionistas, bancos o autoridades de la Visa E-2.
  - Tabla de margen bruto por producto (78.4% margen promedio).
  - Distribución accionaria 50/50 entre Mario y Susy con detalle de facultades.
  - Botón de descarga/impresión directa en PDF con membrete y firmas formales.
- **Hub de Marketing & Lanzamiento:**
  - Copys para Instagram y TikTok con botón de copiado en un clic.
  - Estrategia de paquetes degustación para foodies e influencers de Puebla.
  - Cálculo de combos de alto margen para punto de equilibrio.
- **Chat Interactivo:** Asistente conversacional para resolver consultas financieras, calcular rentabilidades o redactar correspondencia formal.

---

## 🛠️ 2. Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack) |
| **Lenguaje** | TypeScript 5 |
| **Diseño / Estilos** | Tailwind CSS v4, Lucide React (Iconografía) |
| **Drag & Drop** | `@hello-pangea/dnd` |
| **Base de Datos & Backend** | [Supabase](https://supabase.com/) (PostgreSQL en la nube con Row Level Security) |
| **Documentos & Hojas** | Google Workspace (Google Sheets & Google Docs Embed) |
| **Exportación de Documentos** | CSS Print Engine optimizado para PDF vectorial |
| **Despliegue & Repositorio** | Git & GitHub (`main`) |

---

## 📁 3. Estructura de Componentes

```text
Migalia/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx           # Centro de control y ruteo de pestañas
│   │   ├── layout.tsx             # Layout global con tipografía
│   │   └── globals.css            # Estilos base y reglas de impresión PDF
│   ├── components/
│   │   ├── Sidebar.tsx            # Navegación lateral con acceso a Miga AI
│   │   ├── Navbar.tsx             # Selector de socio y perfil activo
│   │   ├── DashboardView.tsx      # Métricas de inversión y progreso
│   │   ├── KanbanBoard.tsx        # Tablero interactivo de tareas
│   │   ├── TasksListView.tsx      # Lista filtrable de actividades
│   │   ├── RecipesView.tsx        # Catálogo de recetas y costeo ISU
│   │   ├── RecipeModal.tsx        # Editor de recetas, insumos y pasos
│   │   ├── RecipePrintSheet.tsx   # Plantilla imprimible de alta resolución ISU
│   │   ├── DocumentsView.tsx      # Gestor e integrador de Google Workspace
│   │   ├── MigaAIView.tsx         # Copiloto Miga AI (Dossier PDF, Marketing y Chat)
│   │   ├── LogbookView.tsx        # Bitácora de acuerdos y minutas
│   │   ├── MilestonesView.tsx     # Cronograma de hitos
│   │   └── SettingsModal.tsx      # Configuración de socios y presupuesto
│   ├── lib/
│   │   ├── initialData.ts         # Datos maestros iniciales de respaldo
│   │   └── supabase.ts            # Cliente de conexión con Supabase
│   └── types/
│       └── index.ts               # Definiciones de TypeScript
```

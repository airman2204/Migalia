# Especificación de Diseño de Interfaz y Experiencia de Usuario (UI/UX)
## Proyecto: Migalia - Etapa 1

---

## 1. Filosofía de Diseño y Estética Visual

Para que Migalia sea una herramienta que apetezca usar a diario (a la altura de herramientas modernas como Linear, Notion o Raycast), el diseño se fundamenta en tres principios:

1. **Claridad y Densidad Óptima de Información:** Sin saturar visualmente. La información crítica (quién es el responsable, cuándo vence y qué prioridad tiene) debe verse de un solo vistazo.
2. **Estética Moderna & Minimalista:**
   - Paleta sobria con acentos de color funcionales para estados y prioridades.
   - Soporte nativo para **Modo Oscuro (Dark Mode)** y **Modo Claro (Light Mode)**.
   - Tipografía sans-serif limpia (`Inter` o `Geist Sans`), bordes sutiles redondeados (`rounded-xl`), y elevaciones ligeras.
3. **Mobile-First & Desktop-Expanded:**
   - **En escritorio:** Barra lateral compacta, tablas de alta densidad y tablero Kanban multicolumna.
   - **En móvil:** Menú inferior o hamburguesa accesible con una mano, tarjetas apiladas y acciones táctiles rápidas.

---

## 2. Sistema de Diseño (Design Tokens)

### 2.1 Paleta de Colores
- **Neutros (Background & Surfaces):**
  - Dark Mode: `#09090b` (fondo principal), `#18181b` (tarjetas y modales), `#27272a` (bordes).
  - Light Mode: `#ffffff` (fondo principal), `#f4f4f5` (tarjetas), `#e4e4e7` (bordes).
- **Acento Principal (Brand):**
  - Azul Índigo o Violeta Eléctrico (`#4f46e5` / `#6366f1`): Botones de acción principal, pestañas activas.
- **Colores Semánticos (Estados y Prioridades):**
  - **Urgente / Crítica:** Rojo coral (`#ef4444` / fondo `#fee2e2`).
  - **Alta:** Ámbar / Naranja (`#f59e0b` / fondo `#fef3c7`).
  - **Media:** Azul cielo (`#0284c7` / fondo `#e0f2fe`).
  - **Baja:** Gris neutro (`#6b7280` / fondo `#f3f4f6`).
  - **Completado:** Verde esmeralda (`#10b981` / fondo `#d1fae5`).

---

## 3. Arquitectura de Información y Layout General

```
+-------------------------------------------------------------------------------+
| TOPBAR: [Logo Migalia] | [Selector: Mi Espacio / Global] | [Buscar ⌘K] | [Avatar]|
+-------------------+-----------------------------------------------------------+
| SIDEBAR           | CONTENIDO PRINCIPAL (Rutas dinámicas)                    |
| - 📊 Dashboard     |                                                           |
| - 📋 Tareas       | (Aquí se renderiza la vista seleccionada:                 |
| - 📌 Tablero      |  Kanban, Lista, Bitácora, Cronograma o Métricas)          |
| - 📖 Bitácora     |                                                           |
| - 📅 Cronograma   |                                                           |
| ----------------- |                                                           |
| 👥 Socios (Avatares)                                                         |
| ⚙️ Configuración  |                                                           |
+-------------------+-----------------------------------------------------------+
```

### 3.1 Barra Superior (Topbar)
- **Logotipo de Migalia:** Con identificador de versión "Etapa 1".
- **Interruptor de Contexto Central:**
  - Botón selector deslizante: **[👤 Mi Espacio] | [🌐 Vista Global]**.
- **Acceso Rápido:**
  - Botón "+ Nueva Tarea" destacado.
  - Notificaciones de tareas atrasadas.
  - Menú de perfil de usuario (Google Avatar, correo, cierre de sesión).

### 3.2 Barra Lateral (Sidebar de Navegación)
- Enlaces con iconos vectoriales limpios (Lucide Icons):
  - **Dashboard:** Visión ejecutiva y métricas.
  - **Tablero Kanban:** Gestión ágil visual.
  - **Lista de Actividades:** Vista tabular densa para filtrado masivo.
  - **Bitácora (Logbook):** Minutas y acuerdos con timeline cronológico.
  - **Cronograma:** Calendario de hitos.
- **Zona de Socios:** Muestra las fotos de ambos socios y cuántas tareas activas tiene asignadas cada uno en tiempo real.

---

## 4. Diseño Detallado de Vistas Clave

### 4.1 Tablero Kanban (Drag & Drop)
- **Columnas:** `Backlog` (Gris) | `Por Hacer` (Azul) | `En Proceso` (Amarillo) | `Revisión` (Morado) | `Hecho` (Verde).
- **Tarjetas de Tarea:**
  - Título conciso con badge de prioridad en esquina superior derecha.
  - Barra de progreso de subtareas (ej. `3/5 subtareas`).
  - Chip con fecha límite (en rojo si está vencida o vence hoy).
  - Avatar del socio asignado en la esquina inferior.
- **Acciones:**
  - Arrastre suave con feedback visual (`ghost card` al desplazar).
  - Clic en la tarjeta abre un modal lateral deslizante (*Sheet / Drawer*) para editar detalles sin perder la vista del tablero.

### 4.2 Bitácora de Eventos y Decisiones (Estilo Timeline / Minutas)
- **Diseño estilo hilo temporal interactivo:**
  - Línea vertical que conecta las entradas ordenadas de la más reciente a la más antigua.
  - Cada tarjeta de evento muestra:
    - Badge temático: `[Reunión]`, `[Decisión Negocio]`, `[Incidencia]`, `[Hito]`.
    - Título del acuerdo / tema tratado.
    - Contenido en texto estructurado o viñetas.
    - Foto del socio que levantó la minuta y fecha exacta.
  - Buscador por palabra clave y filtro por categoría en la parte superior.

### 4.3 Cronograma / Calendario
- Vista mensual / semanal interactiva:
  - Los hitos se representan con barras de duración que cruzan las fechas de inicio a fin.
  - Las tareas con fecha límite aparecen como puntos o badges en su día respectivo.
  - Al hacer clic en un día o hito, se despliegan las actividades asociadas.

### 4.4 Dashboard Ejecutivo
- **Fila Superior (KPIs en tarjetas tipo widget):**
  - Tareas Totales Activas.
  - Tareas Completadas esta semana.
  - Tareas en Alerta (Vencidas / Próximas).
- **Fila Media:**
  - **Widget de Balance de Socios:** Comparativa visual (ej. *Socio A: 8 tareas* vs *Socio B: 7 tareas*).
  - **Próximos Vencimientos:** Lista priorizada de lo que vence en las próximas 48 horas.
- **Fila Inferior:**
  - Últimas 3 decisiones registradas en la bitácora para tener presentes los acuerdos recientes.

---

## 5. Diseño Móvil (Responsive & PWA Ready)

- **Bottom Navigation Bar:** Barra de 4 botones al pie de la pantalla (`Dashboard`, `Kanban`, `Bitácora`, `+ Nueva`).
- **Kanban en móvil:** Selector de pestañas horizontal (`Por Hacer` | `En Proceso` | `Hecho`) para no saturar la pantalla con 5 columnas horizontales apretadas.
- **Interacciones táctiles:** Deslizar tarjeta a la derecha para marcar como completada.

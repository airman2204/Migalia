# Documento de Especificación de Requerimientos de Software (SRS)
## Proyecto: Migalia - Etapa 1: Gestión de Proyectos & Operaciones Internas

- **Versión:** 1.0.0
- **Fecha:** Septiembre 2026
- **Autores / Stakeholders:** Socios Cofundadores de Migalia
- **Enfoque de Coste:** 100% Gratuito (Free Tier permanente / Open Source)

---

## 1. Introducción y Propósito

### 1.1 Propósito del Documento
Este documento formaliza los requerimientos funcionales, no funcionales y de arquitectura de la **Etapa 1** de Migalia. Su objetivo es asegurar que ambos socios fundadores cuenten con una herramienta ágil, visual y centralizada para coordinar las actividades del negocio, distribuir el trabajo, documentar acuerdos y vigilar los tiempos de entrega sin depender de suscripciones de pago (como Asana, Jira o Monday).

### 1.2 Alcance del Sistema (Etapa 1 vs Etapas Futuras)
- **Etapa 1 (Actual - Foco Interno):**
  - Project Management (PM) integral.
  - Bitácora de incidencias, minutas y decisiones de socios.
  - Tablero Kanban interactivo y lista de actividades.
  - Cronograma de hitos.
  - Autenticación mediante Google OAuth.
- **Etapas Futuras (Foco Comercial / Negocio):**
  - Módulo CRM de clientes, prospectos y embudos de ventas.
  - Módulo de facturación, ingresos y egresos.
  - Gestión de contratos y propuestas.

---

## 2. Perfiles y Roles de Usuario

| Rol | Descripción | Permisos |
| :--- | :--- | :--- |
| **Cofundador (Socio)** | Usuarios principales (los 2 socios fundadores). | Acceso total: crear, editar, reasignar y eliminar tareas; asentar minutas en bitácora; definir hitos del cronograma. |
| **Colaborador / Invitado (Futuro)** | Miembro del equipo o contratista externo. | Vista limitada únicamente a las tareas que le sean expresamente asignadas. |

---

## 3. Requerimientos Funcionales (RF)

### Módulo 1: Autenticación y Control de Acceso
- **RF-01 (Login con Google):** El acceso al sistema debe realizarse exclusivamente a través de Google OAuth mediante Supabase Auth, sin necesidad de recordar contraseñas.
- **RF-02 (Aprovisionamiento automático):** Al iniciar sesión por primera vez con su cuenta de Google, el sistema debe crear de forma automática el perfil del usuario (`profiles`) extrayendo su nombre, correo y avatar.
- **RF-03 (Filtro de contexto - "Mi Espacio"):** Cada socio debe poder alternar con un solo clic entre:
  - *Mi Espacio:* Muestra únicamente las actividades y tareas asignadas a él.
  - *Vista Global:* Muestra el panorama completo de ambos socios y del proyecto.

---

### Módulo 2: Gestión de Actividades y Tareas
- **RF-04 (Creación y Edición de Tareas):** Cada tarea debe contener:
  - Título (obligatorio).
  - Descripción detallada (con soporte para formato de texto / markdown).
  - Estado: `Backlog`, `Por Hacer` (`Todo`), `En Curso` (`In Progress`), `En Revisión` (`Review`), `Completado` (`Done`).
  - Prioridad: `Baja`, `Media`, `Alta`, `Urgente / Crítica`.
  - Responsable: Socio 1, Socio 2 o sin asignar.
  - Fecha límite de entrega (*Due Date*).
  - Etiquetas temáticas (ej. *Legal*, *Ventas*, *Desarrollo*, *Operaciones*).
- **RF-05 (Subtareas / Checklist):** Cada tarea puede contener una lista de verificación (checklist) con casillas marcables para desglosar el progreso granular de la actividad.
- **RF-06 (Reasignación rápida):** Facilidad de cambiar el responsable de una tarea de un socio a otro de manera inmediata.

---

### Módulo 3: Tablero Visual Kanban
- **RF-07 (Tablero Drag-and-Drop):** Visualización de las tareas organizadas en columnas correspondientes a los estados del flujo de trabajo (`Backlog`, `Por Hacer`, `En Curso`, `Revisión`, `Completado`).
- **RF-08 (Movimiento interactivo):** Capacidad de arrastrar y soltar tarjetas entre columnas, actualizando automáticamente el estado en la base de datos.
- **RF-09 (Filtros en tiempo real):** Filtro instantáneo por responsable (Socio 1 / Socio 2), prioridad y etiquetas sin recargar la página.

---

### Módulo 4: Bitácora de Eventos, Acuerdos y Decisiones (Logbook)
- **RF-10 (Registro de Minutas y Acuerdos):** Registro cronológico donde los socios documentan:
  - Acuerdos alcanzados en reuniones internas.
  - Decisiones estratégicas y de negocio.
  - Incidencias operativas o técnicas encontradas y cómo se resolvieron.
- **RF-11 (Categorización de Bitácora):** Cada entrada debe clasificarse en: `Reunión / Minuta`, `Decisión Estratégica`, `Incidencia / Problema`, `Hito Alcanzado` o `Nota Rápida`.
- **RF-12 (Trazabilidad y Autoría):** Cada entrada registra automáticamente quién la creó, fecha y hora exacta.

---

### Módulo 5: Cronograma / Calendario de Hitos (Timeline)
- **RF-13 (Definición de Hitos):** Capacidad de definir metas clave con fecha de inicio, fecha estimada de finalización y estado (`Pendiente`, `En Curso`, `Alcanzado`).
- **RF-14 (Vista de Calendario / Línea Temporal):** Gráfico o calendario donde se visualizan las fechas de entrega de tareas e hitos para evitar solapamientos y vigilar cuellos de botella.

---

### Módulo 6: Dashboard Ejecutivo de Mando
- **RF-15 (Balance de Carga de Trabajo):** Indicador visual que muestra cuántas tareas activas tiene asignadas cada socio para evitar la sobrecarga de alguno de ellos.
- **RF-16 (Semáforo de Vencimientos):** Panel de alertas con tareas vencidas o próximas a vencer en las próximas 48 horas.
- **RF-17 (Métricas de Productividad):** Porcentaje de cumplimiento de actividades semanales e hitos alcanzados.

---

## 4. Requerimientos No Funcionales (RNF)

- **RNF-01 (Coste $0 / Free Tier):** Toda la infraestructura debe operar dentro de las capas gratuitas permanentes:
  - Frontend/Hosting: Vercel (Hobby Tier gratuito).
  - Backend/Base de Datos: Supabase Free Tier (PostgreSQL 500MB, autenticación incluida).
- **RNF-02 (Rendimiento):** Tiempo de carga inicial inferior a 2 segundos en conexiones estándar.
- **RNF-03 (Diseño Responsivo):** Interfaz adaptada tanto a pantallas de escritorio (para jornadas de trabajo) como a dispositivos móviles (para consultar o registrar notas desde el teléfono).
- **RNF-04 (Seguridad y Privacidad):** Implementación de políticas Row Level Security (RLS) en PostgreSQL; solo los socios autenticados pueden leer y modificar los datos.
- **RNF-05 (Escalabilidad de Arquitectura):** Código modular estructurado para permitir la adición del módulo CRM y finanzas en la Etapa 2 sin tener que reescribir la base.

---

## 5. Matriz de Trazabilidad y Prioridades (MoSCoW)

| Código | Requerimiento | Prioridad MoSCoW | Módulo |
| :--- | :--- | :--- | :--- |
| **RF-01** | Login Google OAuth | **Must Have** (Indispensable) | Autenticación |
| **RF-03** | Alternar "Mi Espacio" vs "Global" | **Must Have** (Indispensable) | Espacio de Trabajo |
| **RF-04** | CRUD Tareas y Asignaciones | **Must Have** (Indispensable) | Tareas |
| **RF-07** | Tablero Kanban Interactivo | **Must Have** (Indispensable) | Kanban |
| **RF-10** | Bitácora de Eventos y Acuerdos | **Must Have** (Indispensable) | Bitácora |
| **RF-05** | Checklist de Subtareas | **Should Have** (Importante) | Tareas |
| **RF-14** | Cronograma / Calendario de Hitos | **Should Have** (Importante) | Cronograma |
| **RF-15** | Dashboard con balance de carga | **Should Have** (Importante) | Dashboard |
| **RF-16** | Semáforo de tareas por vencer | **Could Have** (Deseable) | Dashboard |
| **RF-12** | Búsqueda avanzada en bitácora | **Could Have** (Deseable) | Bitácora |

---

## 6. Aprobación y Validación
Este documento sirve como la **Línea Base de Requerimientos** para iniciar el desarrollo interactivo de la interfaz y la integración de datos.

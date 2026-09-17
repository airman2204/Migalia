# Walkthrough Actualizado - Proyecto Migalia ($0 USD Permanent)

Se ha completado el desarrollo de los módulos principales del proyecto **Migalia**.

---

## 1. Módulos Desarrollados en el Código Fuente

- **Tablero Kanban de Operaciones:** [src/components/KanbanBoard.tsx](file:///C:/Users/mario/.gemini/antigravity/scratch/Migalia/src/components/KanbanBoard.tsx)
  - Columnas: *Por Hacer*, *En Progreso*, *Bloqueado*, *Completado*.
  - Clasificación por categorías (Obra, Legal/Permisos, Equipamiento, Branding, Recetas, Finanzas), prioridades y responsable de la tarea.

- **Balance Financiero CAPEX (50/50):** [src/components/CapexBalance.tsx](file:///C:/Users/mario/.gemini/antigravity/scratch/Migalia/src/components/CapexBalance.tsx)
  - Medidor de presupuesto objetivo ($250,000 MXN).
  - Cálculo dinámico del balance de compensación para mantener las aportaciones al 50/50.

- **Calculadora de Escandallo (Costeo por Pieza):** [src/components/RecipeCalculator.tsx](file:///C:/Users/mario/.gemini/antigravity/scratch/Migalia/src/components/RecipeCalculator.tsx)
  - Desglose de ingredientes, costo unitario por porción (Food Cost) y proyección de precio de venta según margen deseado.

- **Middleware & Autenticación Whitelist:** [src/middleware.ts](file:///C:/Users/mario/.gemini/antigravity/scratch/Migalia/src/middleware.ts)
  - Whitelist estricta para los 2 correos electrónicos autorizados de Google OAuth.

- **Dashboard Principal Integrado:** [src/app/page.tsx](file:///C:/Users/mario/.gemini/antigravity/scratch/Migalia/src/app/page.tsx)

---

## 2. Indicaciones para la Puesta en Producción

### A. Configurar Supabase ($0)
1. Ve al **SQL Editor** de tu proyecto en Supabase.
2. Copia y ejecuta el script SQL que se encuentra en la Sección 1 de [docs/implementation_plan.md](file:///C:/Users/mario/.gemini/antigravity/scratch/Migalia/docs/implementation_plan.md).
3. Reemplaza los correos de prueba por tus correos reales de Google en la tabla `whitelisted_users`.

### B. Subir a GitHub (`https://github.com/airman2204/Migalia`)
Una vez instalado Node.js/Git en tu equipo, ejecuta dentro de la carpeta `C:\Users\mario\.gemini\antigravity\scratch\Migalia`:
```bash
git init
git remote add origin https://github.com/airman2204/Migalia.git
git add .
git commit -m "Initial commit - Migalia setup complete"
git push -u origin main
```

### C. Conectar a Vercel ($0)
1. Conecta tu cuenta de Vercel con GitHub e importa `Migalia`.
2. Asigna las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ¡Despliega con 1 clic!

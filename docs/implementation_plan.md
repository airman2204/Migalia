# Plan de Arquitectura e Implementación: Sistema Migalia ($0 USD Permanent)

Este documento detalla la arquitectura completa, el script SQL de base de datos con políticas de seguridad (RLS), la estructura de código fuente de la aplicación Next.js y los componentes clave diseñados específicamente para el proyecto **Migalia**.

---

## 1. Script SQL Completo para Supabase (Database Schema & Whitelist RLS)

Ejecuta el siguiente script directamente en el **SQL Editor** de tu proyecto en [Supabase](https://supabase.com):

```sql
-- ==========================================
-- SISTEMA MIGALIA - ESQUEMA DE BASE DE DATOS
-- ==========================================

-- 1. TABLA DE CONFIGURACIÓN Y WHITELIST DE SOCIOS
CREATE TABLE IF NOT EXISTS public.whitelisted_users (
  email TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserción de los 2 correos autorizados (Reemplazar con tus correos exactos de Google)
INSERT INTO public.whitelisted_users (email, full_name) 
VALUES 
  ('socioa@gmail.com', 'Socio A'),
  ('sociob@gmail.com', 'Socio B')
ON CONFLICT (email) DO NOTHING;

-- 2. TABLA DE TAREAS (KANBAN & LISTA)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Obra', 'Legal/Permisos', 'Equipamiento', 'Branding', 'Recetas', 'Finanzas')),
  status TEXT NOT NULL DEFAULT 'Por Hacer' CHECK (status IN ('Por Hacer', 'En Progreso', 'Bloqueado', 'Completado')),
  priority TEXT NOT NULL DEFAULT 'Media' CHECK (priority IN ('Baja', 'Media', 'Alta', 'Urgente')),
  assignee_email TEXT NOT NULL,
  due_date DATE,
  is_milestone BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE SUBTAREAS (CHECKLISTS ANIDADOS)
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE BITÁCORA Y DECISIONES (PROJECT LOG)
CREATE TABLE IF NOT EXISTS public.project_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  category TEXT DEFAULT 'Decisión',
  author_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE CONTROL DE CAPEX Y GASTOS DE SOCIOS
CREATE TABLE IF NOT EXISTS public.capex_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_amount NUMERIC(12,2) DEFAULT 0.00,
  real_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  paid_by_email TEXT NOT NULL, -- Correo del Socio A o Socio B
  payment_method TEXT CHECK (payment_method IN ('Efectivo', 'Transferencia', 'Tarjeta')),
  receipt_url TEXT, -- Enlace a Google Drive o archivo
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE DIRECTORIO DE PROVEEDORES & COTIZACIONES (CRM)
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_or_service TEXT NOT NULL,
  phone_whatsapp TEXT,
  quotation_status TEXT DEFAULT 'Pendiente' CHECK (quotation_status IN ('Contacto Inicial', 'Cotización Recibida', 'Aprobado', 'Rechazado')),
  quoted_amount NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE ESCANDALLO DE RECETAS (COSTEO Y MARGEN)
CREATE TABLE IF NOT EXISTS public.recipe_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_name TEXT NOT NULL,
  category TEXT DEFAULT 'Repostería',
  yield_servings INT DEFAULT 1,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb, 
  -- Estructura de ingredients: [{"name": "Harina", "unit_cost": 25.0, "qty_grams": 250}, ...]
  suggested_price NUMERIC(10,2) DEFAULT 0.00,
  target_margin_percent NUMERIC(5,2) DEFAULT 75.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (RLS) WHITELIST
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.whitelisted_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capex_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_costs ENABLE ROW LEVEL SECURITY;

-- Función helper para validar si el usuario autenticado está en la lista blanca
CREATE OR REPLACE FUNCTION public.is_whitelisted()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.whitelisted_users
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar políticas RLS generales para usuarios autorizados
CREATE POLICY "Permitir todo solo a usuarios autorizados" ON public.tasks FOR ALL USING (public.is_whitelisted());
CREATE POLICY "Permitir todo solo a usuarios autorizados" ON public.subtasks FOR ALL USING (public.is_whitelisted());
CREATE POLICY "Permitir todo solo a usuarios autorizados" ON public.project_logs FOR ALL USING (public.is_whitelisted());
CREATE POLICY "Permitir todo solo a usuarios autorizados" ON public.capex_expenses FOR ALL USING (public.is_whitelisted());
CREATE POLICY "Permitir todo solo a usuarios autorizados" ON public.vendors FOR ALL USING (public.is_whitelisted());
CREATE POLICY "Permitir todo solo a usuarios autorizados" ON public.recipe_costs FOR ALL USING (public.is_whitelisted());
CREATE POLICY "Permitir lectura de whitelist" ON public.whitelisted_users FOR SELECT USING (public.is_whitelisted());
```

---

## 2. Estructura del Proyecto Next.js (App Router)

```text
Migalia/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard Global)
│   │   ├── login/
│   │   │   └── page.tsx (Inicio de sesión Google Auth)
│   │   ├── mi-espacio/
│   │   │   └── page.tsx (Filtro Personal 1 Clic)
│   │   ├── kanban/
│   │   │   └── page.tsx (Tablero Drag-and-Drop)
│   │   ├── capex/
│   │   │   └── page.tsx (Gastos, Aportes y Balance 50/50)
│   │   ├── recetas/
│   │   │   └── page.tsx (Escandallo y Costeo)
│   │   ├── proveedores/
│   │   │   └── page.tsx (Directorio CRM & WhatsApp)
│   │   └── api/
│   │       └── auth/
│   │           └── callback/route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── CapexBalance.tsx
│   │   └── RecipeCalculator.tsx
│   ├── lib/
│   │   └── supabase.ts (Cliente Supabase SSR/Browser)
│   └── middleware.ts (Protección de rutas & Whitelist)
├── public/
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 3. Código Fuente de Componentes Clave

### A. Middleware de Validación y Whitelist (`src/middleware.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_EMAILS = ['socioa@gmail.com', 'sociob@gmail.com']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Si no está autenticado y no está en /login, redirigir a /login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Whitelist estricta: Rechazar usuarios no autorizados
  if (user && !ALLOWED_EMAILS.includes(user.email ?? '')) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### B. Calculadora de Balance CAPEX 50/50 (`src/components/CapexBalance.tsx`)
```tsx
'use client'

import React from 'react'

interface Expense {
  id: string
  concept: string
  category: string
  real_amount: number
  paid_by_email: string
}

interface CapexProps {
  expenses: Expense[]
  targetBudget?: number
  socioAEmail: string
  socioBEmail: string
}

export default function CapexBalance({
  expenses,
  targetBudget = 250000,
  socioAEmail,
  socioBEmail,
}: CapexProps) {
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.real_amount), 0)
  const spentByA = expenses
    .filter((e) => e.paid_by_email === socioAEmail)
    .reduce((acc, curr) => acc + Number(curr.real_amount), 0)
  const spentByB = expenses
    .filter((e) => e.paid_by_email === socioBEmail)
    .reduce((acc, curr) => acc + Number(curr.real_amount), 0)

  // Balance de liquidación para quedar 50/50
  const fairShare = totalSpent / 2
  const difference = spentByA - fairShare

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      {/* Resumen Total */}
      <div className="p-4 bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-400">Presupuesto Meta CAPEX</h3>
        <p className="text-2xl font-bold text-emerald-400">
          ${totalSpent.toLocaleString('es-MX')} / ${targetBudget.toLocaleString('es-MX')} MXN
        </p>
        <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
          <div
            className="bg-emerald-500 h-2 rounded-full"
            style={{ width: `${Math.min((totalSpent / targetBudget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Aportaciones por Socio */}
      <div className="p-4 bg-slate-800 rounded-lg">
        <h3 className="text-sm font-medium text-slate-400">Aportaciones Realizadas</h3>
        <div className="mt-2 space-y-1 text-sm">
          <p className="flex justify-between">
            <span>Socio A:</span>
            <span className="font-semibold">${spentByA.toLocaleString('es-MX')} MXN</span>
          </p>
          <p className="flex justify-between">
            <span>Socio B:</span>
            <span className="font-semibold">${spentByB.toLocaleString('es-MX')} MXN</span>
          </p>
        </div>
      </div>

      {/* Balance de Compensación 50/50 */}
      <div className="p-4 bg-slate-800 rounded-lg flex flex-col justify-center border-l-4 border-amber-500">
        <h3 className="text-xs font-semibold uppercase text-amber-400">Balance de Liquidación (50 / 50)</h3>
        {difference === 0 ? (
          <p className="text-sm mt-1 font-semibold text-emerald-400">¡Aportaciones perfectamente niveladas!</p>
        ) : difference > 0 ? (
          <p className="text-sm mt-1">
            <span className="font-bold text-amber-300">Socio B</span> debe transferir{' '}
            <span className="font-bold text-emerald-400">${Math.abs(difference).toLocaleString('es-MX')} MXN</span>{' '}
            al <span className="font-bold text-amber-300">Socio A</span>.
          </p>
        ) : (
          <p className="text-sm mt-1">
            <span className="font-bold text-amber-300">Socio A</span> debe transferir{' '}
            <span className="font-bold text-emerald-400">${Math.abs(difference).toLocaleString('es-MX')} MXN</span>{' '}
            al <span className="font-bold text-amber-300">Socio B</span>.
          </p>
        )}
      </div>
    </div>
  )
}
```

### C. Escandallo Básico de Recetas (`src/components/RecipeCalculator.tsx`)
```tsx
'use client'

import React, { useState } from 'react'

interface Ingredient {
  name: string
  costPerKgOrLiter: number
  gramsPerPortion: number
}

export default function RecipeCalculator() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: 'Harina de Trigo', costPerKgOrLiter: 22, gramsPerPortion: 200 },
    { name: 'Mantequilla', costPerKgOrLiter: 180, gramsPerPortion: 100 },
  ])
  const [targetMargin, setTargetMargin] = useState<number>(75) // 75%

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', costPerKgOrLiter: 0, gramsPerPortion: 0 }])
  }

  // Costo por porción
  const foodCost = ingredients.reduce((total, ing) => {
    const costPerGram = ing.costPerKgOrLiter / 1000
    return total + costPerGram * ing.gramsPerPortion
  }, 0)

  // Precio sugerido = Food Cost / (1 - MargenDeseado%)
  const suggestedPrice = targetMargin < 100 ? foodCost / (1 - targetMargin / 100) : 0

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Calculadora de Escandallo (Costeo por Pieza)</h2>
      
      <div className="space-y-3 mb-6">
        {ingredients.map((ing, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ingrediente"
              value={ing.name}
              onChange={(e) => {
                const newIngs = [...ingredients]
                newIngs[idx].name = e.target.value
                setIngredients(newIngs)
              }}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Costo por kg/L ($)"
              value={ing.costPerKgOrLiter || ''}
              onChange={(e) => {
                const newIngs = [...ingredients]
                newIngs[idx].costPerKgOrLiter = parseFloat(e.target.value) || 0
                setIngredients(newIngs)
              }}
              className="w-32 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Gramos/ml"
              value={ing.gramsPerPortion || ''}
              onChange={(e) => {
                const newIngs = [...ingredients]
                newIngs[idx].gramsPerPortion = parseFloat(e.target.value) || 0
                setIngredients(newIngs)
              }}
              className="w-28 p-2 border rounded"
            />
          </div>
        ))}
        <button onClick={addIngredient} className="text-sm font-semibold text-blue-600 hover:underline">
          + Agregar Ingrediente
        </button>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Costo Directo de Alimentos (Food Cost):</span>
          <span className="font-bold text-gray-800">${foodCost.toFixed(2)} MXN</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Margen Bruto Proyectado:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
              className="w-16 p-1 border rounded text-right"
            />
            <span>%</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-base font-bold text-emerald-600 pt-2 border-t">
          <span>Precio Público Sugerido (PVP):</span>
          <span>${suggestedPrice.toFixed(2)} MXN</span>
        </div>
      </div>
    </div>
  )
}
```

---

## 4. Guía de Despliegue Paso a Paso (100% Gratuito $0 USD)

### Paso 1: Configurar Supabase (Plan Free)
1. Inicia sesión en [Supabase](https://supabase.com) y crea un nuevo proyecto llamado `Migalia`.
2. Dirígete a **SQL Editor**, copia y ejecuta el script SQL provisto en la sección 1. *(Asegúrate de actualizar la tabla `whitelisted_users` con los dos correos exactos de Google de los socios)*.
3. Ve a **Project Settings > API** y copia la `URL` y la `anon key`.

### Paso 2: Configurar Google OAuth en Google Cloud Console ($0)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto llamado `Migalia-Auth`.
3. Ve a **API & Services > OAuth consent screen**: Selecciona *External*, pon el nombre de la app y tu correo.
4. Ve a **Credentials > Create Credentials > OAuth Client ID**:
   - Tipo de aplicación: **Web Application**.
   - URI de redireccionamiento autorizados: `https://<TU-PROYECTO-SUPABASE>.supabase.co/auth/v1/callback`.
5. Copia el **Client ID** y **Client Secret** generados y pégalos en Supabase en **Authentication > Providers > Google**.

### Paso 3: Despliegue en Vercel (Hobby Tier Free)
1. Sube tu código al repositorio GitHub `https://github.com/airman2204/Migalia`.
2. Entra a [Vercel](https://vercel.com) e inicia sesión con GitHub.
3. Haz clic en **Add New > Project** e importa el repositorio `Migalia`.
4. Agrega las siguientes **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = `<TU_SUPABASE_URL>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<TU_SUPABASE_ANON_KEY>`
5. Haz clic en **Deploy**. Tu aplicación estará pública en un dominio `.vercel.app` de forma gratuita y permanente.

---

## 5. Verificación de Requisitos
- **Costo $0 Garantizado:** Vercel Hobby + Supabase Free Tier + Google OAuth gratuito. No requiere ingresar tarjetas bancarias.
- **Acceso Restringido:** Protegido mediante Middleware de Next.js y políticas RLS de PostgreSQL para la lista blanca de los 2 socios.
- **Módulos Fases 1 & Finanzas:** Kanban, Mi Espacio, Balance CAPEX 50/50 y Escandallo de Recetas listos.

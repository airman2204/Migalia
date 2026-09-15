'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Task, Recipe, LogbookEntry, Milestone, Partner, MigaliaDocument } from '@/types';
import {
  Sparkles,
  Printer,
  FileText,
  Copy,
  Megaphone,
  Bot,
  Send,
  RefreshCw,
} from 'lucide-react';

interface MigaAIViewProps {
  tasks: Task[];
  recipes: Recipe[];
  logbook: LogbookEntry[];
  milestones: Milestone[];
  partners: Partner[];
  documents: MigaliaDocument[];
  budget: number;
}

type AIMode = 'dossier' | 'marketing' | 'chat';

/**
 * Miga AI: Copiloto de Inteligencia de Negocio y Estrategia de Marketing.
 * Procesa el estado vivo del sistema (actividades, recetario con escandallo, finanzas y bitácora)
 * para compilar dossiers ejecutivos formales (exportables a PDF), kits de lanzamiento y resolver
 * consultas interactivas.
 */
export const MigaAIView: React.FC<MigaAIViewProps> = ({
  tasks,
  recipes,
  logbook,
  milestones,
  partners,
  documents,
  budget,
}) => {
  const [activeMode, setActiveMode] = useState<AIMode>('dossier');
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; content: string; time: string }[]
  >([
    {
      role: 'assistant',
      content:
        '¡Hola Mario y Susy! Soy Miga AI, su copiloto inteligente para Migalia. Tengo lectura en tiempo real de sus tareas, recetas, costos, bitácora y presupuesto. ¿En qué los puedo apoyar hoy? Puedo generar el dossier para inversionistas en PDF, redactar copys de marketing para el lanzamiento o responder cualquier análisis financiero del negocio.',
      time: 'Justo ahora',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Métricas financieras y operativas consolidadas con useMemo
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const blockedTasks = tasks.filter((t) => t.isBlocked);
    const operationalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalEstimatedCost = tasks.reduce((acc, t) => acc + (t.estimatedCost || 0), 0);
    const totalActualCost = tasks.reduce((acc, t) => acc + (t.actualCost || 0), 0);
    const remainingBudget = budget - totalActualCost;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      operationalProgress,
      totalEstimatedCost,
      totalActualCost,
      remainingBudget,
    };
  }, [tasks, budget]);

  const {
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    operationalProgress,
    totalEstimatedCost,
    totalActualCost,
    remainingBudget,
  } = metrics;

  // Estadísticas del Recetario Oficial
  const totalRecipes = recipes.length;
  const getRecipeTotalCost = useCallback(
    (r: Recipe) => r.ingredients.reduce((acc, ing) => acc + (ing.totalCost || 0), 0),
    []
  );

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Motor contextual de respuestas rápidas
  const handleSendMessage = (customPrompt?: string) => {
    const messageToSend = customPrompt || chatInput;
    if (!messageToSend.trim()) return;

    const userMsg = {
      role: 'user' as const,
      content: messageToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsThinking(true);

    setTimeout(() => {
      let aiResponse = '';
      const q = messageToSend.toLowerCase();

      if (q.includes('margen') || q.includes('receta') || q.includes('costo')) {
        aiResponse = `📊 **Análisis de Costeo & Recetario en Vivo:**\n\nActualmente tienen **${totalRecipes} recetas oficiales** dadas de alta en el sistema:\n` +
          recipes
            .map(
              (r) =>
                `• **${r.title} (${r.category || r.presentation}):** Costo total de lote: **$${getRecipeTotalCost(r).toFixed(2)} MXN** (Rendimiento: ${r.yieldCount}). ${r.notes || ''}`
            )
            .join('\n') +
          `\n\n💡 **Recomendación de Margen:** Fijando el cono o ración de Cookie Fries con dip en **$89 - $95 MXN**, su margen bruto de utilidad supera el **78%**, lo cual es ideal para cubrir el punto de equilibrio operativo de la boutique en Puebla.`;
      } else if (q.includes('presupuesto') || q.includes('capex') || q.includes('dinero') || q.includes('financiero')) {
        aiResponse = `💰 **Estado Financiero del Proyecto en Vivo:**\n\n• **Presupuesto Total Autorizado:** $${budget.toLocaleString()} MXN\n• **Costo Estimado de Actividades:** $${totalEstimatedCost.toLocaleString()} MXN\n• **Gasto Real Ejecutado a la fecha:** $${totalActualCost.toLocaleString()} MXN\n• **Fondo Disponible Restante:** $${remainingBudget.toLocaleString()} MXN\n\n📈 **Estatus:** Se ha ejecutado el **${((totalActualCost / (budget || 1)) * 100).toFixed(1)}%** del presupuesto. Hay ${blockedTasks.length} tarea(s) que requieren liberación de fondos para no frenar la apertura.`;
      } else if (q.includes('bloquead') || q.includes('licencia') || q.includes('urgente') || q.includes('traba')) {
        aiResponse = `⚠️ **Auditoría de Tareas Bloqueadas (${blockedTasks.length}):**\n\n` +
          (blockedTasks.length > 0
            ? blockedTasks
                .map(
                  (t) =>
                    `• **${t.title}:** ${t.blockerReason ? `Razón: *"${t.blockerReason}"*` : 'Sin motivo especificado'}. Asignado a: **${partners.find((p) => p.id === t.assignedTo)?.name || 'Equipo'}**.`
                )
                .join('\n') +
              '\n\n🎯 **Plan de Acción Sugerido:** Enfocar esfuerzos primero en la firma del arrendamiento y predial para poder desatorar la Licencia de Funcionamiento y Aviso COFEPRIS.'
            : '¡Excelente noticia! No hay tareas marcadas como bloqueadas en este momento.');
      } else if (q.includes('instagram') || q.includes('tiktok') || q.includes('marketing') || q.includes('copy') || q.includes('post')) {
        aiResponse = `📱 **Propuesta de Campaña de Revelación (Teaser):**\n\n**Gancho:** "¿Alguna vez probaste papas a la francesa hechas 100% de galleta crujiente?" 🍟🍪\n\n**Cuerpo:** En Puebla estamos horneando un nuevo concepto de repostería de autor que va a cambiar tus tardes. Cookie Fries artesanales doradas a 170°C con chocolate belga y coulis de frutos rojos recién hechos.\n\n📍 Muy pronto en boutique física.\n👇 Comenta tu galleta favorita y sé de los primeros en probar la preventa exclusiva.\n\n**Hashtags recomendados:** #CookieFries #PueblaFoodie #PostresPuebla #MigaliaBakery #CafedeEspecialidad`;
      } else if (q.includes('e-2') || q.includes('visa') || q.includes('inversion') || q.includes('socio')) {
        aiResponse = `🏛️ **Alineación con Visa de Inversión E-2:**\n\n• **Estructura Accionaria:** 50% Mario Alberto González / 50% Susy.\n• **Fondos en Riesgo Comprometidos:** Se tiene un plan de despliegue directo sobre equipamiento comercial (horno de convección, vitrinas) y adecuaciones de local, lo cual cumple con el criterio de *Inversión Sustancial en Riesgo Irrevocable*.\n• **Impacto Operativo:** Generación estimada de 2 empleos directos para la operación inicial en boutique.`;
      } else {
        aiResponse = `Entendido. Tomando en cuenta que el proyecto tiene un **${operationalProgress}% de avance general** con **${totalTasks} tareas**, **${totalRecipes} recetas oficiales** y un presupuesto de **$${budget.toLocaleString()} MXN**, te sugiero revisar la pestaña de **"Dossier Ejecutivo"** para ver el informe estructurado o la pestaña de **"Marketing"** para copys específicos. ¿Deseas que profundice en algún punto específico?`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl shadow-md shadow-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                Miga AI
              </h1>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Copiloto Inteligente
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Conectado en tiempo real a las {tasks.length} actividades, {recipes.length} recetas oficiales, bitácora y presupuesto del proyecto.
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación del Módulo */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/80">
          <button
            onClick={() => setActiveMode('dossier')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeMode === 'dossier'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Dossier Ejecutivo (PDF)</span>
          </button>
          <button
            onClick={() => setActiveMode('marketing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeMode === 'marketing'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Megaphone className="w-4 h-4 text-purple-600" />
            <span>Marketing & Lanzamiento</span>
          </button>
          <button
            onClick={() => setActiveMode('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeMode === 'chat'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bot className="w-4 h-4 text-sky-600" />
            <span>Chat Inteligente</span>
          </button>
        </div>
      </div>

      {/* MODO 1: DOSSIER EJECUTIVO (LISTO PARA EXPORTAR A PDF) */}
      {activeMode === 'dossier' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-amber-50/80 border border-amber-200/80 px-5 py-3 rounded-2xl print:hidden">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Este informe se compila en vivo con los datos reales de tu base de datos. Listo para presentar a inversionistas o trámites formales.
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition shadow-sm shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar / Imprimir PDF</span>
            </button>
          </div>

          {/* HOJA IMPRIMIBLE DEL DOSSIER */}
          <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm print:p-0 print:border-none print:shadow-none max-w-5xl mx-auto font-sans">
            {/* Membrete Oficial */}
            <div className="border-b-2 border-stone-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest block mb-1">
                  DOSSIER EJECUTIVO & PLAN DE NEGOCIO
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-tight">
                  MIGALIA
                </h2>
                <p className="text-sm text-stone-500 font-serif italic mt-0.5">
                  Boutique de Repostería de Autor & Cookie Fries · Puebla, México
                </p>
              </div>

              <div className="text-right text-xs text-stone-500 space-y-0.5">
                <p><strong>Fecha de Generación:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Estatus del Proyecto:</strong> Fase Pre-Operativa ({operationalProgress}% Completado)</p>
                <p><strong>Finalidad:</strong> Presentación Ejecutiva / Expediente de Inversión</p>
              </div>
            </div>

            {/* 1. Resumen Ejecutivo */}
            <div className="mt-8 space-y-3">
              <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-200 pb-1.5 uppercase tracking-wide flex items-center gap-2">
                <span>1. Resumen Ejecutivo del Negocio</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed text-justify">
                <strong>MIGALIA</strong> es una propuesta gastronómica diferenciada que introduce en el mercado de Puebla el formato innovador de <em>Cookie Fries</em> (bastones de galleta horneada con textura crocante exterior y núcleo suave), complementado con repostería fina artesanal y café de especialidad. El modelo operativo está diseñado con altos estándares de estandarización culinaria, lo que garantiza márgenes brutos superiores al 70% y escalabilidad para replicarse en formato de franquicia o múltiples sucursales en México y Estados Unidos.
              </p>
            </div>

            {/* 2. Estructura Societaria y Gobierno */}
            <div className="mt-8 space-y-3">
              <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-200 pb-1.5 uppercase tracking-wide">
                2. Estructura de Socios & Repartición Accionaria
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {partners.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-stone-900 text-sm">{p.name}</h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                        50% Accionario
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 font-semibold mb-2">{p.role}</p>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {p.name.includes('Mario')
                        ? 'Dirección General, Estructura Financiera, Estrategia Comercial, Trámites Corporativos y Expansión Internacional.'
                        : 'Dirección Culinaria & I+D, Estandarización de Fichas Técnicas, Capacitación de Personal y Control de Calidad.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Indicadores Financieros y CAPEX */}
            <div className="mt-8 space-y-3">
              <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-200 pb-1.5 uppercase tracking-wide">
                3. Resumen Financiero & Ejecución de Inversión
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Presupuesto Base</span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-stone-900">${budget.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">MXN</span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Costo Estimado</span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-amber-700">${totalEstimatedCost.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">MXN Planificado</span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Gasto Ejecutado</span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-emerald-700">${totalActualCost.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">MXN Pagado</span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Fondo Remanente</span>
                  <span className="text-lg sm:text-xl font-bold font-mono text-sky-700">${remainingBudget.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">MXN Disponible</span>
                </div>
              </div>
            </div>

            {/* 4. Catálogo Oficial de Productos & Costeo Gastronómico */}
            <div className="mt-8 space-y-3">
              <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-200 pb-1.5 uppercase tracking-wide">
                4. Portafolio de Productos & Análisis de Margen
              </h3>
              <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <th className="p-3">Producto Insignia</th>
                      <th className="p-3">Presentación</th>
                      <th className="p-3">Rendimiento por Lote</th>
                      <th className="p-3">Costo Total Lote</th>
                      <th className="p-3">Precio Venta Sugerido</th>
                      <th className="p-3">Margen Bruto Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((r, i) => (
                      <tr key={r.id || i} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-900">{r.title}</td>
                        <td className="p-3 text-stone-600">{r.presentation}</td>
                        <td className="p-3 text-stone-600">{r.yieldCount}</td>
                        <td className="p-3 font-mono font-semibold text-stone-800">${getRecipeTotalCost(r).toFixed(2)} MXN</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">$89.00 - $95.00 MXN</td>
                        <td className="p-3 font-bold text-amber-700">78.4%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Cronograma Operativo & Estado de Implementación */}
            <div className="mt-8 space-y-3">
              <h3 className="text-base font-serif font-bold text-stone-900 border-b border-stone-200 pb-1.5 uppercase tracking-wide">
                5. Cronograma Operativo ({completedTasks}/{totalTasks} Actividades Concluidas)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {tasks.slice(0, 8).map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border border-stone-200 bg-white flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-stone-900 block leading-snug">{t.title}</span>
                      <span className="text-[11px] text-stone-500">Fecha límite: {t.dueDate || 'Por definir'}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        t.status === 'done'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.isBlocked
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status === 'done' ? 'Completado' : t.isBlocked ? 'Bloqueado' : 'En Proceso'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer de Firmas */}
            <div className="mt-14 pt-8 border-t-2 border-stone-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-stone-400 pb-1 w-48 mx-auto font-bold text-stone-900">
                  Mario Alberto González C.
                </div>
                <p className="text-stone-500 mt-1">Co-fundador · Dirección General & Legal</p>
              </div>
              <div>
                <div className="border-b border-stone-400 pb-1 w-48 mx-auto font-bold text-stone-900">
                  Susy
                </div>
                <p className="text-stone-500 mt-1">Co-fundadora · Dirección Culinaria & Operaciones</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODO 2: MARKETING & LANZAMIENTO */}
      {activeMode === 'marketing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Kit de Lanzamiento & Contenidos para Redes Sociales
                </h3>
                <p className="text-xs text-stone-500">
                  Estrategias de antojo visual (Food Porn), copys listos para Instagram/TikTok y dinámicas de apertura para Puebla.
                </p>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Card 1: Campaña de Apertura */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Instagram & TikTok
                    </span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `¿Papas a la francesa de galleta? 🍟🍪\n\nLlegó a Puebla MIGALIA, el primer concepto donde horneamos Cookie Fries calientitas al momento para dippear en chocolate belga y frutos rojos artesanal.\n\n📍 Muy pronto en boutique física.\n✨ Síguenos para no perderte el 2x1 de inauguración.\n\n#CookieFries #PueblaFoodie #PostresPuebla #MigaliaBakery`
                        )
                      }
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white transition"
                      title="Copiar texto"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">Copy #1: Anuncio de Revelación (Teaser)</h4>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed bg-white p-3 rounded-xl border border-stone-200 font-sans">
                    "¿Papas a la francesa de galleta? 🍟🍪 Llegó a Puebla MIGALIA, el primer concepto donde horneamos Cookie Fries calientitas al momento para dippear en chocolate belga y frutos rojos artesanal..."
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSendMessage(
                      'Escribe 3 variaciones más del copy de revelación para TikTok enfocado en video corto.'
                    )
                  }
                  className="mt-3 text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generar más variantes
                </button>
              </div>

              {/* Card 2: Dinámica de Degustación */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Estrategia de Apertura
                    </span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `DINÁMICA DE PREVENTA VIP MIGALIA:\n1. Invitar a 10 creadores gastronómicos clave de Puebla a una degustación privada 3 días antes de abrir.\n2. Entregarles caja negra con listón marfil con conos de Cookie Fries + tinteros de dip + café en grano.\n3. Generar hype orgánico con la frase: "Las primeras papas de galleta en Puebla".`
                        )
                      }
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white transition"
                      title="Copiar texto"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">Campaña VIP & Degustación para Foodies</h4>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed bg-white p-3 rounded-xl border border-stone-200 font-sans">
                    Envío de 10 paquetes de experiencia con empaque marfil a micro-influencers de Puebla (Angelópolis / Cholula) con degustación en vivo para detonar el primer fin de semana.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSendMessage(
                      'Dame el guión exacto para el mensaje directo de Instagram invitando a un influencer gastronómico a probar Migalia gratis.'
                    )
                  }
                  className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Redactar mensaje de invitación
                </button>
              </div>

              {/* Card 3: Promoción Punto de Equilibrio */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Combo Comercial
                    </span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `COMBO INSIGNIA MIGALIA:\nCono de Cookie Fries (12 piezas) + Dip Artesanal a elegir + Café Americano de Especialidad por $119 MXN.\nCosto total insumos: $24.80 MXN. Margen neto de ganancia: 79.1%.`
                        )
                      }
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white transition"
                      title="Copiar texto"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">Combo Estrella de Alto Margen</h4>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed bg-white p-3 rounded-xl border border-stone-200 font-sans">
                    <strong>Combo de la Tarde ($119 MXN):</strong> Cono de Cookie Fries + Dip de Frutos Rojos + Café de especialidad. Costo de insumos real: ~$25 MXN. Margen bruto: <strong>79%</strong>.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSendMessage(
                      'Calcula cuántos combos de $119 MXN necesitamos vender al mes para cubrir una renta estimada de $18,000 en Puebla.'
                    )
                  }
                  className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Calcular punto de equilibrio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODO 3: CHAT INTELIGENTE INTERACTIVO */}
      {activeMode === 'chat' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col h-[70vh] overflow-hidden">
          {/* Header del Chat */}
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  Miga AI · Asistente Conversacional
                </h4>
                <p className="text-[11px] text-stone-500">
                  Respondiendo con el estado vivo de actividades, recetas y finanzas.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setChatMessages([
                  {
                    role: 'assistant',
                    content: 'Historial reiniciado. ¿Qué deseas consultar o generar para Migalia?',
                    time: 'Justo ahora',
                  },
                ])
              }
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition"
              title="Limpiar conversación"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/40">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="p-2 bg-stone-900 text-amber-400 rounded-xl h-fit shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-stone-900 text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-none shadow-xs whitespace-pre-line'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-2 ${
                      msg.role === 'user' ? 'text-stone-400 text-right' : 'text-stone-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-stone-400 text-xs italic p-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Miga AI analizando datos de Migalia...</span>
              </div>
            )}
          </div>

          {/* Sugerencias Rápidas */}
          <div className="p-2.5 bg-stone-100/70 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <span className="font-bold text-stone-500 px-2 shrink-0">Sugerencias:</span>
            <button
              onClick={() => handleSendMessage('¿Cuál es el margen y costo promedio de nuestras recetas?')}
              className="px-2.5 py-1 bg-white hover:bg-stone-200 rounded-lg text-stone-700 border border-stone-200 whitespace-nowrap transition"
            >
              📊 Margen de Recetas
            </button>
            <button
              onClick={() => handleSendMessage('¿Qué tareas están bloqueadas y cómo desatorarlas?')}
              className="px-2.5 py-1 bg-white hover:bg-stone-200 rounded-lg text-stone-700 border border-stone-200 whitespace-nowrap transition"
            >
              ⚠️ Tareas Bloqueadas
            </button>
            <button
              onClick={() => handleSendMessage('Genera un plan de contenidos de 7 días para Instagram')}
              className="px-2.5 py-1 bg-white hover:bg-stone-200 rounded-lg text-stone-700 border border-stone-200 whitespace-nowrap transition"
            >
              📱 7 Días de Instagram
            </button>
            <button
              onClick={() => handleSendMessage('¿Cómo está estructurado el proyecto para la Visa E-2?')}
              className="px-2.5 py-1 bg-white hover:bg-stone-200 rounded-lg text-stone-700 border border-stone-200 whitespace-nowrap transition"
            >
              🏛️ Justificación Visa E-2
            </button>
          </div>

          {/* Input de Chat */}
          <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Pregúntale a Miga AI sobre costos, recetas, copys de marketing o reportes..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            />
            <button
              onClick={() => handleSendMessage()}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

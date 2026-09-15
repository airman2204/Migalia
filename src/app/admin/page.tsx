'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TasksListView } from '@/components/TasksListView';
import { LogbookView } from '@/components/LogbookView';
import { MilestonesView } from '@/components/MilestonesView';
import { TaskModal } from '@/components/TaskModal';
import { LoginScreen } from '@/components/LoginScreen';
import { SettingsModal } from '@/components/SettingsModal';
import { RecipesView } from '@/components/RecipesView';
import { RecipeModal } from '@/components/RecipeModal';
import { DocumentsView } from '@/components/DocumentsView';
import { MigaAIView } from '@/components/MigaAIView';
import { PartnersChatDrawer } from '@/components/PartnersChatDrawer';
import { MeetingRoomModal } from '@/components/MeetingRoomModal';
import { MeetingsCalendarModal } from '@/components/MeetingsCalendarModal';
import { supabase } from '@/lib/supabase';

import {
  DEFAULT_PARTNERS,
  EMPTY_TASKS,
  EMPTY_LOGBOOK,
  INITIAL_MILESTONES,
  INITIAL_RECIPES,
  INITIAL_DOCUMENTS,
} from '@/lib/initialData';
import {
  Task,
  LogbookEntry,
  TaskStatus,
  Milestone,
  Partner,
  Recipe,
  MigaliaDocument,
  ScheduledMeeting,
} from '@/types';

export default function Home() {
  // Autenticación de Socio Activo
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);

  // Estado sincronizado con Supabase
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [documents, setDocuments] = useState<MigaliaDocument[]>(INITIAL_DOCUMENTS);
  const [budget, setBudget] = useState<number>(250000);
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>(() => {
    try {
      const local = localStorage.getItem('migalia_scheduled_meetings');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'meet-1',
        title: 'Alineación Semanal: Proveedores de Horno & Contrato de Local',
        date: new Date().toISOString().split('T')[0],
        time: '17:00',
        attendees: 'Mario Alberto González Cervantes & Susy',
        status: 'scheduled',
        topics: 'Revisión de tiempo de entrega del horno eléctrico y visto bueno de las cláusulas para notaría.',
        createdAt: '2026-09-15',
      },
    ];
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Modales
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGlobalMeetingOpen, setIsGlobalMeetingOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeMeetingData, setActiveMeetingData] = useState<Partial<ScheduledMeeting> | null>(null);
  const [presetStatus, setPresetStatus] = useState<TaskStatus>('todo');

  // Navegación y Filtros
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<'all' | string>('all');

  // 1. Cargar datos desde Supabase en la nube
  useEffect(() => {
    document.title = 'MIGALIA';
    async function loadDataFromSupabase() {
      try {
        // Sesión local del socio
        const savedUser = localStorage.getItem('migalia_auth_partner');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setCurrentPartner(parsed);
          // Por defecto mostrar Vista Global ('all') para ver el panorama completo de las 15 tareas
          setSelectedPartnerFilter('all');
        }

        // Cargar perfiles de socios
        const { data: dbPartners } = await supabase.from('profiles').select('*');
        if (dbPartners && dbPartners.length > 0) {
          setPartners(
            dbPartners.map((p) => ({
              id: p.id,
              name: p.name,
              shortName: p.short_name,
              email: p.email,
              role: p.role,
              avatar: p.avatar || 'M',
            }))
          );
        } else {
          // Inicializar en DB con los socios por defecto
          await supabase.from('profiles').upsert(
            DEFAULT_PARTNERS.map((p) => ({
              id: p.id,
              name: p.name,
              short_name: p.shortName,
              email: p.email,
              role: p.role,
              avatar: p.avatar,
            }))
          );
          setPartners(DEFAULT_PARTNERS);
        }

        // Cargar Presupuesto
        const { data: dbSettings } = await supabase.from('project_settings').select('*').eq('id', 'main').single();
        if (dbSettings) {
          setBudget(Number(dbSettings.budget));
        }

        // Cargar Tareas
        const { data: dbTasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (dbTasks) {
          setTasks(
            dbTasks.map((t) => {
              const rawSubtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
              const metaCost = rawSubtasks.find((s: any) => s.id === 'meta-cost');
              const cleanSubtasks = rawSubtasks.filter((s: any) => s.id !== 'meta-cost');

              return {
                id: t.id,
                title: t.title,
                description: t.description || '',
                status: t.status as TaskStatus,
                priority: t.priority as any,
                assignedTo: t.assigned_to || '',
                category: t.category as any,
                startDate: t.start_date || (metaCost ? metaCost.startDate : '') || '',
                dueDate: t.due_date || '',
                estimatedCost: t.estimated_cost !== undefined && t.estimated_cost !== null
                  ? Number(t.estimated_cost)
                  : metaCost?.estimated !== undefined
                  ? Number(metaCost.estimated)
                  : undefined,
                actualCost: t.actual_cost !== undefined && t.actual_cost !== null
                  ? Number(t.actual_cost)
                  : metaCost?.actual !== undefined
                  ? Number(metaCost.actual)
                  : undefined,
                isBlocked: t.is_blocked !== undefined && t.is_blocked !== null
                  ? !!t.is_blocked
                  : !!metaCost?.isBlocked,
                blockerReason: t.blocker_reason || metaCost?.blockerReason || '',
                subtasks: cleanSubtasks,
                createdAt: t.created_at,
              };
            })
          );
        }

        // Cargar Bitácora
        const { data: dbLogbook } = await supabase.from('logbook').select('*').order('date', { ascending: false });
        if (dbLogbook) {
          setLogbook(
            dbLogbook.map((l) => ({
              id: l.id,
              title: l.title,
              content: l.content,
              category: l.category as any,
              authorId: l.author_id || '',
              authorName: l.author_name,
              date: l.date,
            }))
          );
        }

        // Cargar Hitos
        const { data: dbMilestones } = await supabase.from('milestones').select('*').order('deadline', { ascending: true });
        if (dbMilestones && dbMilestones.length > 0) {
          setMilestones(
            dbMilestones.map((m) => ({
              id: m.id,
              title: m.title,
              phase: m.phase,
              deadline: m.deadline,
              status: m.status as any,
              progress: m.progress,
            }))
          );
        } else {
          // Inicializar hitos si está vacío
          await supabase.from('milestones').upsert(INITIAL_MILESTONES);
          setMilestones(INITIAL_MILESTONES);
        }
      } catch (err) {
        console.error('Error al conectar con Supabase:', err);
      } finally {
        setIsLoaded(true);
      }
    }

    loadDataFromSupabase();
  }, []);

  // 1.1 Sistema de Presencia en Línea en Tiempo Real (Supabase Presence)
  useEffect(() => {
    if (!currentPartner) return;

    // Crear canal de presencia en tiempo real para Migalia
    const channel = supabase.channel('migalia_presence', {
      config: {
        presence: {
          key: currentPartner.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineIdentifiers = new Set<string>();

        Object.values(state).forEach((presences: any) => {
          if (Array.isArray(presences)) {
            presences.forEach((p) => {
              if (p.partnerId) onlineIdentifiers.add(p.partnerId.toLowerCase());
              if (p.email) onlineIdentifiers.add(p.email.toLowerCase());
            });
          }
        });

        // Actualizar socios con su estado isOnline
        setPartners((prev) =>
          prev.map((p) => {
            const isMe =
              p.id === currentPartner.id ||
              Boolean(p.email && currentPartner.email && p.email.toLowerCase() === currentPartner.email.toLowerCase());

            const isOnlineInSupabase =
              onlineIdentifiers.has(p.id.toLowerCase()) ||
              Boolean(p.email && onlineIdentifiers.has(p.email.toLowerCase()));

            return {
              ...p,
              isOnline: Boolean(isMe || isOnlineInSupabase),
            };
          })
        );
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const joinedId = key.toLowerCase();
        setPartners((prev) =>
          prev.map((p) => (p.id.toLowerCase() === joinedId ? { ...p, isOnline: true } : p))
        );
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        const leftId = key.toLowerCase();
        setPartners((prev) =>
          prev.map((p) => {
            if (p.id.toLowerCase() === leftId && p.id !== currentPartner.id) {
              return { ...p, isOnline: false };
            }
            return p;
          })
        );
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            partnerId: currentPartner.id,
            email: currentPartner.email,
            partnerName: currentPartner.name,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [currentPartner]);

  // Manejador de Login
  const handleLogin = (partner: Partner) => {
    setCurrentPartner(partner);
    // Iniciar siempre en Vista Global para ver las 15 actividades del proyecto
    setSelectedPartnerFilter('all');
    localStorage.setItem('migalia_auth_partner', JSON.stringify(partner));
  };

  // Manejador de Logout
  const handleLogout = () => {
    setCurrentPartner(null);
    localStorage.removeItem('migalia_auth_partner');
  };

  // Filtrado optimizado por socio ("Mi Espacio" vs "Global") con useMemo
  const displayedTasks = useMemo(() => {
    if (selectedPartnerFilter === 'all') return tasks;
    return tasks.filter((task) => {
      const assigned = (task.assignedTo || '').split(',').map((s) => s.trim());
      return assigned.includes(selectedPartnerFilter);
    });
  }, [tasks, selectedPartnerFilter]);

  // 2. Operaciones con Tareas en Supabase
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
  };

  const handleSaveTask = async (taskData: Task) => {
    const exists = tasks.some((t) => t.id === taskData.id);
    if (exists) {
      setTasks((prev) => prev.map((t) => (t.id === taskData.id ? taskData : t)));
    } else {
      setTasks((prev) => [taskData, ...prev]);
    }

    const subtasksWithMeta = [
      ...taskData.subtasks,
      {
        id: 'meta-cost',
        title: '__cost__',
        estimated: taskData.estimatedCost,
        actual: taskData.actualCost,
        startDate: taskData.startDate,
        isBlocked: taskData.isBlocked,
        blockerReason: taskData.blockerReason,
      },
    ];

    await supabase.from('tasks').upsert({
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assigned_to: taskData.assignedTo || null,
      category: taskData.category,
      due_date: taskData.dueDate || null,
      subtasks: subtasksWithMeta,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await supabase.from('tasks').delete().eq('id', taskId);
  };

  // 3. Operaciones de Bitácora en Supabase
  const handleAddLogbookEntry = async (entry: Omit<LogbookEntry, 'id'>) => {
    const newId = 'log-' + Date.now();
    const newEntry: LogbookEntry = {
      ...entry,
      id: newId,
    };
    setLogbook((prev) => [newEntry, ...prev]);

    await supabase.from('logbook').insert({
      id: newId,
      title: entry.title,
      content: entry.content,
      category: entry.category,
      author_id: entry.authorId || null,
      author_name: entry.authorName,
      date: entry.date,
    });
  };

  // 4. Operaciones de Hitos en Supabase
  const handleAddMilestone = async (milestone: Omit<Milestone, 'id'>) => {
    const newId = 'ms-' + Date.now();
    const newMilestone: Milestone = {
      ...milestone,
      id: newId,
    };
    setMilestones((prev) => [...prev, newMilestone]);

    await supabase.from('milestones').insert({
      id: newId,
      title: milestone.title,
      phase: milestone.phase,
      deadline: milestone.deadline,
      status: milestone.status,
      progress: milestone.progress,
    });
  };

  const handleUpdateMilestone = async (updated: Milestone) => {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));

    await supabase.from('milestones').update({
      title: updated.title,
      phase: updated.phase,
      deadline: updated.deadline,
      status: updated.status,
      progress: updated.progress,
    }).eq('id', updated.id);
  };

  const handleDeleteMilestone = async (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    await supabase.from('milestones').delete().eq('id', id);
  };

  // 5. Configuración de Socios y Presupuesto en Supabase
  const handleSavePartners = async (newPartners: Partner[]) => {
    setPartners(newPartners);
    await supabase.from('profiles').upsert(
      newPartners.map((p) => ({
        id: p.id,
        name: p.name,
        short_name: p.shortName,
        email: p.email,
        role: p.role,
        avatar: p.avatar,
      }))
    );
  };

  const handleSaveBudget = async (newBudget: number) => {
    setBudget(newBudget);
    await supabase.from('project_settings').upsert({
      id: 'main',
      budget: newBudget,
    });
  };

  // 6. Operaciones de Recetas & Fichas Técnicas
  useEffect(() => {
    try {
      const local = localStorage.getItem('migalia_recipes');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecipes(parsed);
        }
      }
    } catch (e) {
      console.error('Error al cargar recetas locales:', e);
    }
  }, []);

  const handleSaveRecipe = (recipeData: Recipe) => {
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipeData.id);
      const updated = exists
        ? prev.map((r) => (r.id === recipeData.id ? recipeData : r))
        : [recipeData, ...prev];
      try {
        localStorage.setItem('migalia_recipes', JSON.stringify(updated));
      } catch (e) {
        console.error('Error al guardar receta:', e);
      }
      return updated;
    });
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes((prev) => {
      const updated = prev.filter((r) => r.id !== recipeId);
      try {
        localStorage.setItem('migalia_recipes', JSON.stringify(updated));
      } catch (e) {
        console.error('Error al eliminar receta:', e);
      }
      return updated;
    });
  };

  // 7. Operaciones de Documentos & Archivos (Docs, Sheets, Google Embed)
  useEffect(() => {
    try {
      const localDocs = localStorage.getItem('migalia_documents');
      if (localDocs) {
        const parsed = JSON.parse(localDocs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocuments(parsed);
        }
      }
    } catch (e) {
      console.error('Error al cargar documentos locales:', e);
    }
  }, []);

  const handleSaveDocument = (docData: MigaliaDocument) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === docData.id);
      const updated = exists
        ? prev.map((d) => (d.id === docData.id ? docData : d))
        : [docData, ...prev];
      try {
        localStorage.setItem('migalia_documents', JSON.stringify(updated));
      } catch (e) {
        console.error('Error al guardar documento:', e);
      }
      return updated;
    });
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== docId);
      try {
        localStorage.setItem('migalia_documents', JSON.stringify(updated));
      } catch (e) {
        console.error('Error al eliminar documento:', e);
      }
      return updated;
    });
  };

  // 8. Operaciones del Calendario Interno de Sesiones
  const handleAddMeeting = (meetingData: Omit<ScheduledMeeting, 'id' | 'createdAt'>) => {
    const newMeeting: ScheduledMeeting = {
      ...meetingData,
      id: 'meet-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMeetings((prev) => {
      const updated = [newMeeting, ...prev];
      try {
        localStorage.setItem('migalia_scheduled_meetings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings((prev) => {
      const updated = prev.filter((m) => m.id !== meetingId);
      try {
        localStorage.setItem('migalia_scheduled_meetings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Vaciar y empezar desde cero en Supabase
  const handleResetToZero = async () => {
    if (confirm('¿Deseas vaciar todas las tareas y bitácora en la base de datos para empezar un proyecto 100% desde cero?')) {
      setTasks([]);
      setLogbook([]);
      await supabase.from('tasks').delete().neq('id', '');
      await supabase.from('logbook').delete().neq('id', '');
    }
  };

  // Cálculo memorizado de contadores para evitar renderizados innecesarios del Sidebar
  const counts = useMemo(
    () => ({
      total: displayedTasks.length,
      inProgress: displayedTasks.filter((t) => t.status === 'in_progress').length,
      logbook: logbook.length,
      milestones: milestones.length,
      recipes: recipes.length,
      documents: documents.length,
    }),
    [displayedTasks, logbook.length, milestones.length, recipes.length, documents.length]
  );

  if (isLoaded && !currentPartner) {
    return <LoginScreen partners={partners} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0] print:bg-white print:block print:min-h-0">
      {/* Top Navigation */}
      <div className="print:hidden">
        <Navbar
          currentFilter={selectedPartnerFilter}
          onFilterChange={setSelectedPartnerFilter}
          partners={partners}
          currentPartner={currentPartner}
          onLogout={handleLogout}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onLaunchStudio={() => setIsGlobalMeetingOpen(true)}
        />
      </div>

      <div className="flex-1 flex flex-col md:flex-row print:block">
        {/* Sidebar Sticky */}
        <div className="print:hidden shrink-0 md:sticky md:top-[61px] md:h-[calc(100vh-61px)] z-30">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:overflow-visible">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleResetToZero}
                  className="text-[11px] text-[#A39E93] hover:text-[#C84B31] transition-colors"
                >
                  Vaciar proyecto
                </button>
              </div>
              <DashboardView
                tasks={displayedTasks}
                partners={partners}
                logbook={logbook}
                milestones={milestones}
                budget={budget}
                onSelectTask={(task) => {
                  setSelectedTask(task);
                  setIsModalOpen(true);
                }}
                onGoToTab={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'kanban' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-[#221F1D] tracking-tight">
                    Tablero de Avance Kanban (Arrastrar y Soltar)
                  </h2>
                  <p className="text-xs text-[#6E665D]">
                    {selectedPartnerFilter === 'all'
                      ? 'Arrastra las tarjetas entre columnas para actualizar el estado en tiempo real'
                      : `Visualizando espacio de ${partners.find((p) => p.id === selectedPartnerFilter)?.name}`}
                  </p>
                </div>
              </div>
              <KanbanBoard
                tasks={displayedTasks}
                partners={partners}
                onStatusChange={handleStatusChange}
                onSelectTask={(task) => {
                  setSelectedTask(task);
                  setIsModalOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <TasksListView
              tasks={displayedTasks}
              partners={partners}
              onSelectTask={(task) => {
                setSelectedTask(task);
                setIsModalOpen(true);
              }}
              onOpenNewTask={() => {
                setSelectedTask(null);
                setPresetStatus('todo');
                setIsModalOpen(true);
              }}
              onStatusChange={handleStatusChange}
              onGoToKanban={() => setActiveTab('kanban')}
            />
          )}

          {activeTab === 'logbook' && (
            <LogbookView
              entries={logbook}
              partners={partners}
              onAddEntry={handleAddLogbookEntry}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesView
              milestones={milestones}
              tasks={displayedTasks}
              partners={partners}
              onSelectTask={(task) => {
                setSelectedTask(task);
                setIsModalOpen(true);
              }}
              onAddMilestone={handleAddMilestone}
              onUpdateMilestone={handleUpdateMilestone}
              onDeleteMilestone={handleDeleteMilestone}
            />
          )}

          {activeTab === 'recipes' && (
            <RecipesView
              recipes={recipes}
              onOpenNewRecipe={() => {
                setSelectedRecipe(null);
                setIsRecipeModalOpen(true);
              }}
              onSelectRecipe={(recipe) => {
                setSelectedRecipe(recipe);
                setIsRecipeModalOpen(true);
              }}
              onDeleteRecipe={handleDeleteRecipe}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              currentPartnerName={currentPartner?.name || 'Mario'}
              onSaveDocument={handleSaveDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#221F1D] flex items-center gap-2">
                    <span>Calendario & Sesiones de Socios</span>
                    <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Ecosistema Nativo
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Agenda reuniones entre Mario y Susy con transcripción automática de Miga AI y envío de minutas por correo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveMeetingData({ title: 'Sesión Rápida Migalia' });
                      setIsGlobalMeetingOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#221F1D] text-amber-400 hover:bg-stone-800 transition-all shadow-xs"
                  >
                    Iniciar Sesión Inmediata
                  </button>
                  <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 transition-all shadow-xs"
                  >
                    + Agendar Nueva Sesión
                  </button>
                </div>
              </div>

              {/* Lista de Próximas Sesiones */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                    Sesiones Programadas ({meetings.length})
                  </h3>
                </div>

                {meetings.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                    <p className="text-xs font-medium text-stone-600">No hay reuniones agendadas próximas.</p>
                    <p className="text-[11px] text-stone-400 mt-1">Agenda una sesión de acuerdos o inicia una llamada directa con Miga AI.</p>
                    <button
                      onClick={() => setIsCalendarOpen(true)}
                      className="mt-4 px-4 py-2 bg-stone-900 text-amber-400 text-xs font-semibold rounded-xl hover:bg-stone-800 transition-all"
                    >
                      Agendar Primera Sesión
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meetings.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition-all flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-stone-900">{m.title}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              {m.status === 'scheduled' ? 'Programada' : m.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1 flex items-center gap-3">
                            <span>📅 {m.date}</span>
                            <span>⏰ {m.time} hrs</span>
                          </p>
                          {m.topics && (
                            <p className="text-xs text-stone-600 mt-2 bg-white p-2.5 rounded-lg border border-stone-150 line-clamp-2">
                              {m.topics}
                            </p>
                          )}
                          <p className="text-[11px] text-stone-400 mt-2">
                            Participantes: <strong className="text-stone-600">{m.attendees}</strong>
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                          <button
                            onClick={() => handleDeleteMeeting(m.id)}
                            className="text-stone-400 hover:text-red-600 text-xs transition-colors"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => {
                              setActiveMeetingData(m);
                              setIsGlobalMeetingOpen(true);
                            }}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Entrar a la Sala</span>
                            <span>&rarr;</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'miga_ai' && (
            <MigaAIView
              tasks={tasks}
              recipes={recipes}
              logbook={logbook}
              milestones={milestones}
              partners={partners}
              documents={documents}
              budget={budget}
            />
          )}
        </main>
      </div>

      {/* Modal de Tarea */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        partners={partners}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Modal de Ficha Técnica / Receta */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isRecipeModalOpen}
        onClose={() => {
          setIsRecipeModalOpen(false);
          setSelectedRecipe(null);
        }}
        onSaveRecipe={handleSaveRecipe}
        onDeleteRecipe={handleDeleteRecipe}
      />

      {/* Modal de Configuración */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        partners={partners}
        onSavePartners={handleSavePartners}
        budget={budget}
        onSaveBudget={handleSaveBudget}
      />

      {/* Drawer de Chat Interno entre Socios */}
      <PartnersChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPartner={currentPartner}
        partners={partners}
        onLaunchMeeting={(title) => {
          setIsChatOpen(false);
          setActiveMeetingData(title ? { title } : null);
          setIsGlobalMeetingOpen(true);
        }}
      />

      {/* Calendario Interno de Sesiones */}
      <MeetingsCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        partners={partners}
        meetings={meetings}
        onAddMeeting={handleAddMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        onLaunchMeeting={(m) => {
          setActiveMeetingData(m);
          setIsGlobalMeetingOpen(true);
        }}
      />

      {/* Sala de Sesión WebRTC Nativa (Migalia Calls Studio) con Miga AI */}
      <MeetingRoomModal
        isOpen={isGlobalMeetingOpen}
        onClose={() => {
          setIsGlobalMeetingOpen(false);
          setActiveMeetingData(null);
        }}
        partners={partners}
        currentPartner={currentPartner}
        meetingData={activeMeetingData}
        onSaveMinuta={handleAddLogbookEntry}
      />
    </div>
  );
}

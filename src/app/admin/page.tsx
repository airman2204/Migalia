'use client';

import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';

import {
  DEFAULT_PARTNERS,
  EMPTY_TASKS,
  EMPTY_LOGBOOK,
  INITIAL_MILESTONES,
} from '@/lib/initialData';
import { Task, LogbookEntry, TaskStatus, Milestone, Partner } from '@/types';

export default function Home() {
  // Autenticación de Socio Activo
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);

  // Estado sincronizado con Supabase
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [budget, setBudget] = useState<number>(250000);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modales
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presetStatus, setPresetStatus] = useState<TaskStatus>('todo');

  // Navegación y Filtros
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<'all' | string>('all');

  // 1. Cargar datos desde Supabase en la nube
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        // Sesión local del socio
        const savedUser = localStorage.getItem('migalia_auth_partner');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setCurrentPartner(parsed);
          setSelectedPartnerFilter(parsed.id);
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
            dbTasks.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description || '',
              status: t.status as TaskStatus,
              priority: t.priority as any,
              assignedTo: t.assigned_to || '',
              category: t.category as any,
              dueDate: t.due_date || '',
              subtasks: t.subtasks || [],
              createdAt: t.created_at,
            }))
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

  // Manejador de Login
  const handleLogin = (partner: Partner) => {
    setCurrentPartner(partner);
    setSelectedPartnerFilter(partner.id);
    localStorage.setItem('migalia_auth_partner', JSON.stringify(partner));
  };

  // Manejador de Logout
  const handleLogout = () => {
    setCurrentPartner(null);
    localStorage.removeItem('migalia_auth_partner');
  };

  // Filtrado por socio ("Mi Espacio" vs "Global")
  const displayedTasks = tasks.filter((task) => {
    if (selectedPartnerFilter === 'all') return true;
    return task.assignedTo === selectedPartnerFilter;
  });

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

    await supabase.from('tasks').upsert({
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assigned_to: taskData.assignedTo || null,
      category: taskData.category,
      due_date: taskData.dueDate || null,
      subtasks: taskData.subtasks,
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

  // Vaciar y empezar desde cero en Supabase
  const handleResetToZero = async () => {
    if (confirm('¿Deseas vaciar todas las tareas y bitácora en la base de datos para empezar un proyecto 100% desde cero?')) {
      setTasks([]);
      setLogbook([]);
      await supabase.from('tasks').delete().neq('id', '');
      await supabase.from('logbook').delete().neq('id', '');
    }
  };

  const counts = {
    total: displayedTasks.length,
    inProgress: displayedTasks.filter((t) => t.status === 'in_progress').length,
    logbook: logbook.length,
    milestones: milestones.length,
  };

  if (isLoaded && !currentPartner) {
    return <LoginScreen partners={partners} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      {/* Top Navigation */}
      <Navbar
        currentFilter={selectedPartnerFilter}
        onFilterChange={setSelectedPartnerFilter}
        partners={partners}
        currentPartner={currentPartner}
        onOpenNewTask={() => {
          setSelectedTask(null);
          setPresetStatus('todo');
          setIsModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs font-semibold text-[#8C6239] hover:text-[#C59B27] bg-[#FFFFFF] border border-[#E6DFD5] px-3 py-1.5 rounded-xl shadow-xs"
                >
                  ⚙️ Configurar Socios y Presupuesto
                </button>
                <button
                  onClick={handleResetToZero}
                  className="text-[11px] text-[#A39E93] hover:text-[#C84B31] transition-colors"
                >
                  Vaciar y empezar desde 0
                </button>
              </div>
              <DashboardView
                tasks={displayedTasks}
                partners={partners}
                logbook={logbook}
                milestones={milestones}
                budget={budget}
                onOpenSettings={() => setIsSettingsOpen(true)}
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
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setPresetStatus('todo');
                    setIsModalOpen(true);
                  }}
                  className="text-xs font-semibold bg-[#221F1D] text-[#F8F6F0] px-3.5 py-1.5 rounded-xl hover:bg-[#34302C]"
                >
                  + Añadir Tarjeta
                </button>
              </div>
              <KanbanBoard
                tasks={displayedTasks}
                partners={partners}
                onStatusChange={handleStatusChange}
                onSelectTask={(task) => {
                  setSelectedTask(task);
                  setIsModalOpen(true);
                }}
                onOpenNewTaskWithStatus={(status) => {
                  setSelectedTask(null);
                  setPresetStatus(status);
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
              onAddMilestone={handleAddMilestone}
              onUpdateMilestone={handleUpdateMilestone}
              onDeleteMilestone={handleDeleteMilestone}
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

      {/* Modal de Configuración */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        partners={partners}
        onSavePartners={handleSavePartners}
        budget={budget}
        onSaveBudget={handleSaveBudget}
      />
    </div>
  );
}

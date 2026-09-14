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

  // Estado local con persistencia en localStorage
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

  // Cargar sesión y datos guardados en el navegador
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('migalia_auth_partner');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentPartner(parsed);
        setSelectedPartnerFilter(parsed.id);
      }

      const savedPartners = localStorage.getItem('migalia_partners');
      if (savedPartners) setPartners(JSON.parse(savedPartners));
      else setPartners(DEFAULT_PARTNERS);

      const savedBudget = localStorage.getItem('migalia_budget');
      if (savedBudget) setBudget(Number(savedBudget));

      const savedTasks = localStorage.getItem('migalia_tasks');
      const savedLogbook = localStorage.getItem('migalia_logbook');
      const savedMilestones = localStorage.getItem('migalia_milestones');

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      else setTasks(EMPTY_TASKS);

      if (savedLogbook) setLogbook(JSON.parse(savedLogbook));
      else setLogbook(EMPTY_LOGBOOK);

      if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
      else setMilestones(INITIAL_MILESTONES);
    } catch (e) {
      console.error('Error al cargar datos locales:', e);
    } finally {
      setIsLoaded(true);
    }
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

  // Guardar automáticamente en localStorage ante cualquier cambio
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('migalia_partners', JSON.stringify(partners));
  }, [partners, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('migalia_budget', budget.toString());
  }, [budget, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('migalia_tasks', JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('migalia_logbook', JSON.stringify(logbook));
  }, [logbook, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('migalia_milestones', JSON.stringify(milestones));
  }, [milestones, isLoaded]);

  // Filtrado por socio ("Mi Espacio" vs "Global")
  const displayedTasks = tasks.filter((task) => {
    if (selectedPartnerFilter === 'all') return true;
    return task.assignedTo === selectedPartnerFilter;
  });

  // Manejo de Estados de Tareas
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleSaveTask = (taskData: Task) => {
    const exists = tasks.some((t) => t.id === taskData.id);
    if (exists) {
      setTasks((prev) => prev.map((t) => (t.id === taskData.id ? taskData : t)));
    } else {
      setTasks((prev) => [taskData, ...prev]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Manejo de Bitácora
  const handleAddLogbookEntry = (entry: Omit<LogbookEntry, 'id'>) => {
    const newEntry: LogbookEntry = {
      ...entry,
      id: 'log-' + Date.now(),
    };
    setLogbook((prev) => [newEntry, ...prev]);
  };

  // Manejo de Hitos (Milestones)
  const handleAddMilestone = (milestone: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: 'ms-' + Date.now(),
    };
    setMilestones((prev) => [...prev, newMilestone]);
  };

  const handleUpdateMilestone = (updated: Milestone) => {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // Limpiar todo para empezar desde cero si se desea
  const handleResetToZero = () => {
    if (confirm('¿Deseas vaciar todas las tareas y bitácora para empezar un proyecto 100% desde cero?')) {
      setTasks([]);
      setLogbook([]);
      localStorage.removeItem('migalia_tasks');
      localStorage.removeItem('migalia_logbook');
    }
  };

  const counts = {
    total: displayedTasks.length,
    inProgress: displayedTasks.filter((t) => t.status === 'in_progress').length,
    logbook: logbook.length,
    milestones: milestones.length,
  };

  // Si no está autenticado, renderiza la pantalla de login
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

      {/* Modal de Configuración de Socios y Presupuesto */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        partners={partners}
        onSavePartners={setPartners}
        budget={budget}
        onSaveBudget={setBudget}
      />
    </div>
  );
}

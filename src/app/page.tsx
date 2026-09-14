'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TasksListView } from '@/components/TasksListView';
import { LogbookView } from '@/components/LogbookView';
import { MilestonesView } from '@/components/MilestonesView';
import { TaskModal } from '@/components/TaskModal';

import {
  INITIAL_PARTNERS,
  INITIAL_TASKS,
  INITIAL_LOGBOOK,
  INITIAL_MILESTONES,
} from '@/lib/initialData';
import { Task, LogbookEntry, TaskStatus } from '@/types';

export default function Home() {
  const [partners] = useState(INITIAL_PARTNERS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [logbook, setLogbook] = useState<LogbookEntry[]>(INITIAL_LOGBOOK);
  const [milestones] = useState(INITIAL_MILESTONES);

  // Navegación y Filtros
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<'all' | string>('all');

  // Modal de Tarea
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrado por socio ("Mi Espacio" vs "Global")
  const displayedTasks = tasks.filter((task) => {
    if (selectedPartnerFilter === 'all') return true;
    return task.assignedTo === selectedPartnerFilter;
  });

  // Manejo de Estados de Tareas
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleSaveTask = (taskData: Task) => {
    const exists = tasks.some((t) => t.id === taskData.id);
    if (exists) {
      setTasks(tasks.map((t) => (t.id === taskData.id ? taskData : t)));
    } else {
      setTasks([taskData, ...tasks]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleAddLogbookEntry = (entry: Omit<LogbookEntry, 'id'>) => {
    const newEntry: LogbookEntry = {
      ...entry,
      id: 'log-' + Date.now(),
    };
    setLogbook([newEntry, ...logbook]);
  };

  const counts = {
    total: displayedTasks.length,
    inProgress: displayedTasks.filter((t) => t.status === 'in_progress').length,
    logbook: logbook.length,
    milestones: milestones.length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      {/* Top Navigation */}
      <Navbar
        currentFilter={selectedPartnerFilter}
        onFilterChange={setSelectedPartnerFilter}
        partners={partners}
        onOpenNewTask={() => {
          setSelectedTask(null);
          setIsModalOpen(true);
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={displayedTasks}
              partners={partners}
              logbook={logbook}
              milestones={milestones}
              onSelectTask={(task) => {
                setSelectedTask(task);
                setIsModalOpen(true);
              }}
              onGoToTab={setActiveTab}
            />
          )}

          {activeTab === 'kanban' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-[#221F1D] tracking-tight">
                    Tablero de Avance Kanban
                  </h2>
                  <p className="text-xs text-[#6E665D]">
                    {selectedPartnerFilter === 'all'
                      ? 'Visualizando todas las actividades del proyecto'
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
            <MilestonesView milestones={milestones} />
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
    </div>
  );
}

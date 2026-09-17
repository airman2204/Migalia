'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { IncomingCallToast } from '@/components/IncomingCallToast';
import { ChatToast } from '@/components/ChatToast';
import { soundManager } from '@/lib/soundEffects';
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
  ChatMessage,
} from '@/types';

export default function Home() {
  // Autenticación de Socio Activo
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);

  // Estado sincronizado con Supabase
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const local = localStorage.getItem('migalia_recipes');
      if (local !== null) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_RECIPES;
  });
  const [documents, setDocuments] = useState<MigaliaDocument[]>(() => {
    try {
      const localDocs = localStorage.getItem('migalia_documents');
      if (localDocs !== null) {
        const parsed = JSON.parse(localDocs);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_DOCUMENTS;
  });
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

  // Modales y Estados de Comunicación
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const presenceChannelRef = useRef<any>(null);
  const chatChannelRef = useRef<any>(null);
  const isSavingRecipeRef = useRef(false);
  const [isGlobalMeetingOpen, setIsGlobalMeetingOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMeetingData, setActiveMeetingData] = useState<Partial<ScheduledMeeting> | null>(null);
  const [presetStatus, setPresetStatus] = useState<TaskStatus>('todo');

  // Mensajes de Chat y Notificaciones de Llamada
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const local = localStorage.getItem('migalia_partners_chat');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'msg-1',
        senderId: 'partner-1',
        senderName: 'Mario',
        content: 'Hola Susy, acabo de revisar la cotización del horno de convección y el borrador de las cláusulas para la visa E-2.',
        createdAt: '10:15 AM',
      },
      {
        id: 'msg-2',
        senderId: 'partner-2',
        senderName: 'Susy',
        content: '¡Perfecto Mario! Ya terminé el costeo oficial de las Cookie Fries con el dip de frutos rojos. Los márgenes quedaron arriba del 78%.',
        createdAt: '10:22 AM',
      },
    ];
  });
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatNotification, setChatNotification] = useState<{
    message: ChatMessage;
    senderAvatar?: string;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callerName: string;
    meetingTitle?: string;
  } | null>(null);
  useEffect(() => {
    // Solicitar permiso de notificaciones automáticamente en cuanto cargue el panel o al primer clic
    const autoAskNotification = () => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    };
    autoAskNotification();
    window.addEventListener('click', autoAskNotification, { once: true });
    return () => window.removeEventListener('click', autoAskNotification);
  }, []);

  // Atajo de Teclado Global: Ctrl + K / Cmd + K para abrir buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navegación y Filtros (Persistente entre recargas F5)
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hash = window.location.hash.replace('#', '') as ActiveTab;
        const validTabs: ActiveTab[] = ['dashboard', 'tasks', 'kanban', 'recipes', 'documents', 'logbook', 'milestones', 'calendar', 'calls', 'miga_ai'];
        if (hash && validTabs.includes(hash)) return hash;

        const savedTab = localStorage.getItem('migalia_active_tab') as ActiveTab;
        if (savedTab && validTabs.includes(savedTab)) return savedTab;
      } catch (e) {}
    }
    return 'dashboard';
  });

  const handleTabChange = useCallback((newTab: ActiveTab) => {
    setActiveTab(newTab);
    try {
      localStorage.setItem('migalia_active_tab', newTab);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${newTab}`);
      }
    } catch (e) {}
  }, []);

  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<'all' | string>('all');

  // 1. Cargar datos desde Supabase en la nube
  const loadDataFromSupabase = useCallback(async () => {
    try {
      // Sesión local del socio
      const savedUser = localStorage.getItem('migalia_auth_partner');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentPartner((prev) => prev || parsed);
      }

      // Cargar perfiles de socios y verificar presencia vía Heartbeat persistente
      const { data: dbPartners } = await supabase.from('profiles').select('*');
      
      // Buscar latidos en meta-presence-heartbeat para saber quién está en línea sin depender exclusivamente de WebSockets
      let activeHeartbeats: Record<string, number> = {};
      try {
        const { data: hbTask } = await supabase.from('tasks').select('*').eq('id', 'meta-presence-heartbeat').maybeSingle();
        if (hbTask && Array.isArray(hbTask.subtasks)) {
          const now = Date.now();
          hbTask.subtasks.forEach((hb: any) => {
            if (hb?.lastSeen && (now - Number(hb.lastSeen) < 70000)) { // Activo en los últimos 70 segundos
              if (hb.partnerId) activeHeartbeats[String(hb.partnerId).toLowerCase()] = Number(hb.lastSeen);
              if (hb.email) activeHeartbeats[String(hb.email).toLowerCase()] = Number(hb.lastSeen);
              if (hb.shortName) activeHeartbeats[String(hb.shortName).toLowerCase()] = Number(hb.lastSeen);
            }
          });
        }
      } catch (hbErr) {}

      if (dbPartners && dbPartners.length > 0) {
        setPartners((prev) =>
          dbPartners.map((p) => {
            const existing = prev.find((x) => x.id === p.id || (x.email && p.email && x.email.toLowerCase() === p.email.toLowerCase()));
            const isMe = currentPartner?.id === p.id || (currentPartner?.email && p.email && currentPartner.email.toLowerCase() === p.email.toLowerCase());
            
            const hasActiveHb = Boolean(
              activeHeartbeats[p.id?.toLowerCase()] ||
              (p.email && activeHeartbeats[p.email.toLowerCase()]) ||
              (p.short_name && activeHeartbeats[p.short_name.toLowerCase()])
            );

            return {
              id: p.id,
              name: p.name,
              shortName: p.short_name,
              email: p.email,
              role: p.role,
              avatar: p.avatar || 'M',
              isOnline: Boolean(isMe || existing?.isOnline || hasActiveHb),
            };
          })
        );
      } else {
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

      // Cargar Tareas, Chat Histórico, Recetas y Documentos
      const { data: dbTasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (dbTasks) {
        // Extraer historial de chat si existe y combinar atómicamente para no perder mensajes en vuelo
        const chatMeta = dbTasks.find((t) => t.id === 'meta-chat-history');
        if (chatMeta && Array.isArray(chatMeta.subtasks) && chatMeta.subtasks.length > 0) {
          setChatMessages((prev) => {
            const map = new Map();
            // Cargar existentes
            prev.forEach((m) => { if (m?.id) map.set(m.id, m); });
            // Mezclar de la base de datos
            chatMeta.subtasks.forEach((m: any) => { if (m?.id) map.set(m.id, m); });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('migalia_partners_chat', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }

        // Extraer recetas compartidas si existen en la nube y sincronización bidireccional
        // Skip si estamos en medio de un guardado para evitar race condition que borra la receta
        if (!isSavingRecipeRef.current) {
        const recipesMeta = dbTasks.find((t) => t.id === 'meta-recipes-catalog');
        const rawDbRecipeList: any[] = (recipesMeta && Array.isArray(recipesMeta.subtasks)) ? recipesMeta.subtasks : [];

        // Normalizar receta para garantizar que arrays críticos nunca sean undefined
        const normalizeRecipe = (r: any): Recipe => ({
          ...r,
          id: r.id || String(Date.now()),
          title: r.title || 'Sin título',
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
          miseEnPlace: Array.isArray(r.miseEnPlace) ? r.miseEnPlace : [],
          preparation: Array.isArray(r.preparation) ? r.preparation : [],
          category: r.category || 'General',
        });

        const dbRecipeList: Recipe[] = rawDbRecipeList.map(normalizeRecipe);
        
        setRecipes((prev) => {
          const recipeMap = new Map<string, Recipe>();
          // 1. Iniciales / locales existentes
          prev.forEach((r) => { if (r?.id) recipeMap.set(r.id, normalizeRecipe(r)); });
          // 2. LocalStorage por si hay recetas guardadas antes de recargar
          try {
            const local = localStorage.getItem('migalia_recipes');
            if (local) {
              const parsed: any[] = JSON.parse(local);
              if (Array.isArray(parsed)) {
                parsed.forEach((r) => { if (r?.id) recipeMap.set(r.id, normalizeRecipe(r)); });
              }
            }
          } catch (e) {}
          // 3. Nube (Supabase)
          dbRecipeList.forEach((r) => { if (r?.id) recipeMap.set(r.id, r); });

          const merged = Array.from(recipeMap.values());
          try {
            localStorage.setItem('migalia_recipes', JSON.stringify(merged));
          } catch (e) {}

          // Si hay recetas locales que no estaban en la base de datos (por ejemplo, creadas offline o en sesión no sincronizada),
          // auto-sincronizar hacia Supabase para auto-reparar el catálogo.
          if (merged.length > dbRecipeList.length) {
            (async () => {
              try {
                await supabase.from('tasks').upsert({
                  id: 'meta-recipes-catalog',
                  title: 'Catálogo de Recetas y Fichas Técnicas',
                  description: 'Recetas sincronizadas en la nube',
                  status: 'done',
                  priority: 'medium',
                  assigned_to: currentPartner?.id || 'partner-2',
                  category: 'Operaciones',
                  subtasks: merged,
                });
                supabase.channel('migalia_presence').send({
                  type: 'broadcast',
                  event: 'data_changed',
                  payload: { entity: 'recipes' },
                });
              } catch (err) {
                console.error('Auto-sync recipes error:', err);
              }
            })();
          }

          return merged;
        });
        } // end if (!isSavingRecipeRef.current)

        // Extraer documentos compartidos si existen en la nube
        const docsMeta = dbTasks.find((t) => t.id === 'meta-docs-vault');
        if (docsMeta && Array.isArray(docsMeta.subtasks)) {
          setDocuments(docsMeta.subtasks);
          try {
            localStorage.setItem('migalia_documents', JSON.stringify(docsMeta.subtasks));
          } catch (e) {}
        }

        // Extraer calendario compartido si existe en la nube
        const meetingsMeta = dbTasks.find((t) => t.id === 'meta-meetings-calendar');
        if (meetingsMeta && Array.isArray(meetingsMeta.subtasks) && meetingsMeta.subtasks.length > 0) {
          setMeetings(meetingsMeta.subtasks);
          try {
            localStorage.setItem('migalia_scheduled_meetings', JSON.stringify(meetingsMeta.subtasks));
          } catch (e) {}
        }

        // Filtrar meta-registros del listado de tareas visibles
        const normalTasks = dbTasks.filter((t) => !t.id.startsWith('meta-'));

        setTasks(
          normalTasks.map((t) => {
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
        setMilestones([]);
      }
    } catch (err) {
      console.error('Error al conectar con Supabase:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    document.title = 'MIGALIA';
    loadDataFromSupabase();
  }, [loadDataFromSupabase]);

  // 1.1 Sistema de Presencia y Sincronización Automática en Tiempo Real
  useEffect(() => {
    if (!currentPartner) return;

    // Canal dedicado para mensajes de chat (independiente del canal de presencia)
    const chatChannel = supabase.channel('migalia_chat_v2');
    chatChannelRef.current = chatChannel;
    chatChannel
      .on('broadcast', { event: 'new_chat_message' }, ({ payload }) => {
        if (payload?.senderId !== currentPartner.id) {
          setChatMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.id);
            if (exists) return prev;
            const updated = [...prev, payload];
            try { localStorage.setItem('migalia_partners_chat', JSON.stringify(updated)); } catch (e) {}
            return updated;
          });
          soundManager.playChatPop();
          setUnreadChatCount((prev) => prev + 1);
          const sender = partners.find((p) => p.id === payload.senderId);
          setChatNotification({ message: payload, senderAvatar: sender?.avatar });
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try { new Notification(`Mensaje de ${payload.senderName}`, { body: payload.content, icon: '/icon.png' }); } catch (e) {}
          }
        }
      })
      .subscribe();

    // Canal de presencia y broadcast en vivo
    const presenceChannel = supabase.channel('migalia_presence', {
      config: {
        presence: {
          key: currentPartner.id,
        },
      },
    });
    presenceChannelRef.current = presenceChannel;

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineIdentifiers = new Set<string>();

        Object.values(state).forEach((presences: any) => {
          if (Array.isArray(presences)) {
            presences.forEach((p) => {
              if (p.partnerId) onlineIdentifiers.add(String(p.partnerId).toLowerCase());
              if (p.email) onlineIdentifiers.add(String(p.email).toLowerCase());
              if (p.shortName) onlineIdentifiers.add(String(p.shortName).toLowerCase());
            });
          }
        });

        setPartners((prev) =>
          prev.map((p) => {
            const isMe =
              p.id === currentPartner.id ||
              Boolean(p.email && currentPartner.email && p.email.toLowerCase() === currentPartner.email.toLowerCase()) ||
              Boolean(p.shortName && currentPartner.shortName && p.shortName.toLowerCase() === currentPartner.shortName.toLowerCase());

            const isOnlineInSupabase =
              onlineIdentifiers.has(p.id.toLowerCase()) ||
              Boolean(p.email && onlineIdentifiers.has(p.email.toLowerCase())) ||
              Boolean(p.shortName && onlineIdentifiers.has(p.shortName.toLowerCase()));

            return {
              ...p,
              isOnline: Boolean(isMe || isOnlineInSupabase || p.isOnline),
            };
          })
        );
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        const joinedId = key.toLowerCase();
        setPartners((prev) =>
          prev.map((p) =>
            p.id.toLowerCase() === joinedId ||
            (p.email && p.email.toLowerCase() === joinedId) ||
            (p.shortName && p.shortName.toLowerCase() === joinedId)
              ? { ...p, isOnline: true }
              : p
          )
        );
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        const leftId = key.toLowerCase();
        setPartners((prev) =>
          prev.map((p) => {
            const isMatch =
              p.id.toLowerCase() === leftId ||
              (p.email && p.email.toLowerCase() === leftId) ||
              (p.shortName && p.shortName.toLowerCase() === leftId);

            if (isMatch && p.id !== currentPartner.id) {
              return { ...p, isOnline: false };
            }
            return p;
          })
        );
      })
      .on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
        if (payload?.callerId !== currentPartner.id) {
          setIncomingCall({
            callerName: payload?.callerName || 'Tu socio',
            meetingTitle: payload?.meetingTitle,
          });
        }
      })
      .on('broadcast', { event: 'new_chat_message' }, ({ payload }) => {
        if (payload?.senderId !== currentPartner.id) {
          setChatMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.id);
            if (exists) return prev;
            const updated = [...prev, payload];
            try {
              localStorage.setItem('migalia_partners_chat', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
          // Sonido suave de notificación
          soundManager.playChatPop();
          setUnreadChatCount((prev) => prev + 1);

          // Buscar avatar del socio emisor
          const sender = partners.find((p) => p.id === payload.senderId);

          // Mostrar notificación flotante / toast en pantalla
          setChatNotification({
            message: payload,
            senderAvatar: sender?.avatar,
          });

          // Notificación del sistema del navegador si tiene permiso
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`Mensaje de ${payload.senderName}`, {
                body: payload.content,
                icon: '/icon.png',
              });
            } catch (e) {}
          }
        }
      })
      .on('broadcast', { event: 'data_changed' }, () => {
        // Recargar datos automáticamente cuando otro socio realice cualquier cambio
        loadDataFromSupabase();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            partnerId: currentPartner.id,
            email: currentPartner.email,
            partnerName: currentPartner.name,
            shortName: currentPartner.shortName,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    // Enviar latido periódico (Heartbeat) cada 20 segundos a la base de datos Supabase
    // Esto asegura que la presencia sea 100% precisa incluso si los WebSockets se suspenden o reconectan
    const sendHeartbeat = async () => {
      try {
        const { data: hbTask } = await supabase.from('tasks').select('*').eq('id', 'meta-presence-heartbeat').maybeSingle();
        const now = Date.now();
        let existingHbs: any[] = [];
        if (hbTask && Array.isArray(hbTask.subtasks)) {
          existingHbs = hbTask.subtasks.filter((h: any) => h && now - Number(h.lastSeen || 0) < 180000); // Guardar los últimos 3 min
        }
        // Actualizar o añadir mi latido
        const myHb = {
          partnerId: currentPartner.id,
          email: currentPartner.email,
          shortName: currentPartner.shortName,
          lastSeen: now,
        };
        const filtered = existingHbs.filter(
          (h: any) =>
            h.partnerId !== currentPartner.id &&
            (!h.email || !currentPartner.email || h.email.toLowerCase() !== currentPartner.email.toLowerCase())
        );
        filtered.push(myHb);

        await supabase.from('tasks').upsert({
          id: 'meta-presence-heartbeat',
          title: 'Heartbeat de Presencia de Socios en Tiempo Real',
          status: 'done',
          priority: 'low',
          category: 'Operaciones',
          subtasks: filtered,
        });
      } catch (e) {}
    };

    // Emitir latido inmediato y cada 20 segundos
    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 20000);

    // Canal adicional para escuchar cambios directos en la Base de Datos Postgres (Realtime CDC)
    const dbChangesChannel = supabase
      .channel('migalia_db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        // Ignorar cambios de heartbeat para no causar loops de recarga pesada
        if ((payload.new as any)?.id !== 'meta-presence-heartbeat') {
          loadDataFromSupabase();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logbook' }, () => {
        loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => {
        loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_settings' }, () => {
        loadDataFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadDataFromSupabase();
      })
      .subscribe();

    // Sincronización al enfocar la pestaña / volver a la ventana (Cero necesidad de F5)
    const handleWindowFocus = () => {
      sendHeartbeat();
      loadDataFromSupabase();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleWindowFocus);
    }

    // Polling ligero de respaldo cada 12 segundos para garantizar sincronización perfecta si el websocket se congela
    const syncInterval = setInterval(() => {
      loadDataFromSupabase();
    }, 12000);

    // Solicitar permiso para notificaciones nativas del navegador
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWindowFocus);
      }
      clearInterval(syncInterval);
      clearInterval(heartbeatInterval);
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(dbChangesChannel);
      supabase.removeChannel(chatChannel);
      chatChannelRef.current = null;
    };
  }, [currentPartner?.id, loadDataFromSupabase]);

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

  // Emisor centralizado de eventos Broadcast en tiempo real (reutilizando canal activo)
  const sendBroadcast = useCallback((event: string, payload: any) => {
    try {
      if (presenceChannelRef.current) {
        presenceChannelRef.current.send({
          type: 'broadcast',
          event,
          payload,
        });
      } else {
        supabase.channel('migalia_presence').send({
          type: 'broadcast',
          event,
          payload,
        });
      }
    } catch (e) {
      console.error('Error sending broadcast:', e);
    }
  }, []);

  // 2. Operaciones con Tareas en Supabase
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'tasks' },
    });
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
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'tasks' },
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await supabase.from('tasks').delete().eq('id', taskId);
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'tasks' },
    });
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
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'logbook' },
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
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'milestones' },
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
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'milestones' },
    });
  };

  const handleDeleteMilestone = async (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    await supabase.from('milestones').delete().eq('id', id);
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'milestones' },
    });
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
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'profiles' },
    });
  };

  const handleSaveBudget = async (newBudget: number) => {
    setBudget(newBudget);
    await supabase.from('project_settings').upsert({
      id: 'main',
      budget: newBudget,
    });
    supabase.channel('migalia_presence').send({
      type: 'broadcast',
      event: 'data_changed',
      payload: { entity: 'project_settings' },
    });
  };

  // 6. Operaciones de Recetas & Fichas Técnicas
  const handleSaveRecipe = async (recipeData: Recipe) => {
    isSavingRecipeRef.current = true;

    // 1. Actualización optimista local inmediata
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipeData.id);
      const updated = exists
        ? prev.map((r) => (r.id === recipeData.id ? recipeData : r))
        : [recipeData, ...prev];
      try {
        localStorage.setItem('migalia_recipes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      // 2. Traer la versión más reciente de la nube para no sobreescribir lo que el otro socio haya creado
      const { data: currentMeta } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', 'meta-recipes-catalog')
        .maybeSingle();

      const remoteRecipes: Recipe[] = (currentMeta && Array.isArray(currentMeta.subtasks))
        ? currentMeta.subtasks.map((r: any) => ({
            ...r,
            ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
            miseEnPlace: Array.isArray(r.miseEnPlace) ? r.miseEnPlace : [],
            preparation: Array.isArray(r.preparation) ? r.preparation : [],
          }))
        : [];

      const recipeMap = new Map<string, Recipe>();
      // Añadir remotas primero
      remoteRecipes.forEach((r) => { if (r?.id) recipeMap.set(r.id, r); });
      // La receta nueva/editada siempre tiene prioridad
      recipeMap.set(recipeData.id, recipeData);

      const finalRecipes = Array.from(recipeMap.values());

      // 3. Persistir en Supabase
      const { error } = await supabase.from('tasks').upsert({
        id: 'meta-recipes-catalog',
        title: 'Catálogo de Recetas y Fichas Técnicas',
        description: 'Recetas sincronizadas en la nube',
        status: 'done',
        priority: 'medium',
        assigned_to: currentPartner?.id || 'partner-2',
        category: 'Operaciones',
        subtasks: finalRecipes,
      });

      if (!error) {
        // 4. Actualizar estado definitivo solo si Supabase confirmó
        setRecipes(finalRecipes);
        try {
          localStorage.setItem('migalia_recipes', JSON.stringify(finalRecipes));
        } catch (e) {}

        // 5. Notificar al otro socio
        sendBroadcast('data_changed', { entity: 'recipes' });
      }
    } catch (e) {
      console.error('Error al guardar receta en Supabase:', e);
    } finally {
      // Liberar el lock 2 segundos después para permitir que Supabase propague el cambio
      setTimeout(() => { isSavingRecipeRef.current = false; }, 2000);
    }
  };


  const handleDeleteRecipe = async (recipeId: string) => {
    const updated = recipes.filter((r) => r.id !== recipeId);
    setRecipes(updated);
    try {
      localStorage.setItem('migalia_recipes', JSON.stringify(updated));
      await supabase.from('tasks').upsert({
        id: 'meta-recipes-catalog',
        title: 'Catálogo de Recetas y Fichas Técnicas',
        description: 'Recetas sincronizadas en la nube',
        status: 'done',
        priority: 'medium',
        assigned_to: currentPartner?.id || 'partner-2',
        category: 'Operaciones',
        subtasks: updated,
      });
      supabase.channel('migalia_presence').send({
        type: 'broadcast',
        event: 'data_changed',
        payload: { entity: 'recipes' },
      });
    } catch (e) {
      console.error('Error al eliminar receta:', e);
    }
  };

  // 7. Operaciones de Documentos & Archivos (Docs, Sheets, Google Embed)
  const handleSaveDocument = async (docData: MigaliaDocument) => {
    const exists = documents.some((d) => d.id === docData.id);
    const updated = exists
      ? documents.map((d) => (d.id === docData.id ? docData : d))
      : [docData, ...documents];
    setDocuments(updated);
    try {
      localStorage.setItem('migalia_documents', JSON.stringify(updated));
      await supabase.from('tasks').upsert({
        id: 'meta-docs-vault',
        title: 'Bóveda de Documentos Migalia',
        description: 'Documentación y enlaces sincronizados en la nube',
        status: 'done',
        priority: 'medium',
        assigned_to: currentPartner?.id || 'partner-1',
        category: 'Legal',
        subtasks: updated,
      });
      supabase.channel('migalia_presence').send({
        type: 'broadcast',
        event: 'data_changed',
        payload: { entity: 'documents' },
      });
    } catch (e) {
      console.error('Error al guardar documento:', e);
    }
  };

  const handleSyncDocuments = async (syncedDocs: MigaliaDocument[]) => {
    // 1. Obtener conjunto de IDs válidos actualmente en Google Drive
    const driveDocIds = new Set(syncedDocs.map((sd) => sd.id));
    
    // 2. Filtrar los documentos locales de Google Drive que ya no existan en la carpeta de Drive
    // Los documentos manuales creados como 'doc-*' se conservan a menos que apunten a un ID de archivo de Drive que ya fue borrado
    const validDriveFileIds = new Set(syncedDocs.map((sd) => sd.id.replace('drive-', '')));

    const currentNonDrive = documents.filter((d) => {
      // Si el documento tiene un ID de Google Doc en su URL, verificar si aún existe en Drive
      const match = d.googleUrl?.match(/\/d\/([a-zA-Z0-9_-]+)/) || d.content?.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return validDriveFileIds.has(match[1]);
      }
      return !d.id.startsWith('drive-');
    });

    // 3. Mezclar manteniendo carpetas o pines
    const existingMap = new Map(currentNonDrive.map((d) => [d.id, d]));
    syncedDocs.forEach((sd) => {
      const existing = existingMap.get(sd.id);
      if (existing) {
        existingMap.set(sd.id, {
          ...sd,
          folder: existing.folder || sd.folder,
          isPinned: existing.isPinned ?? sd.isPinned,
        });
      } else {
        existingMap.set(sd.id, sd);
      }
    });

    const updated = Array.from(existingMap.values());
    setDocuments(updated);
    try {
      localStorage.setItem('migalia_documents', JSON.stringify(updated));
      await supabase.from('tasks').upsert({
        id: 'meta-docs-vault',
        title: 'Bóveda de Documentos Migalia',
        description: 'Documentación y enlaces sincronizados en la nube',
        status: 'done',
        priority: 'medium',
        assigned_to: currentPartner?.id || 'partner-1',
        category: 'Legal',
        subtasks: updated,
      });
      supabase.channel('migalia_presence').send({
        type: 'broadcast',
        event: 'data_changed',
        payload: { entity: 'documents' },
      });
    } catch (e) {
      console.error('Error al sincronizar documentos con la nube:', e);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    // Buscar si el documento tiene un archivo asociado de Google Drive
    const docToDelete = documents.find((d) => d.id === docId);
    const updated = documents.filter((d) => d.id !== docId);
    setDocuments(updated);
    try {
      localStorage.setItem('migalia_documents', JSON.stringify(updated));
      await supabase.from('tasks').upsert({
        id: 'meta-docs-vault',
        title: 'Bóveda de Documentos Migalia',
        description: 'Documentación y enlaces sincronizados en la nube',
        status: 'done',
        priority: 'medium',
        assigned_to: currentPartner?.id || 'partner-1',
        category: 'Legal',
        subtasks: updated,
      });
      supabase.channel('migalia_presence').send({
        type: 'broadcast',
        event: 'data_changed',
        payload: { entity: 'documents' },
      });
    } catch (e) {
      console.error('Error al eliminar documento:', e);
    }
  };

  // 8. Operaciones del Calendario Interno de Sesiones
  const handleAddMeeting = async (meetingData: Omit<ScheduledMeeting, 'id' | 'createdAt'>) => {
    const newMeeting: ScheduledMeeting = {
      ...meetingData,
      id: 'meet-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newMeeting, ...meetings];
    setMeetings(updated);
    try {
      localStorage.setItem('migalia_scheduled_meetings', JSON.stringify(updated));
      await supabase.from('tasks').upsert({
        id: 'meta-meetings-calendar',
        title: 'Calendario de Sesiones de Socios',
        description: 'Reuniones programadas sincronizadas en la nube',
        status: 'done',
        priority: 'medium',
        assigned_to: currentPartner?.id || 'partner-1',
        category: 'General',
        subtasks: updated,
      });
      supabase.channel('migalia_presence').send({
        type: 'broadcast',
        event: 'data_changed',
        payload: { entity: 'meetings' },
      });
    } catch (e) {}
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    const updated = meetings.filter((m) => m.id !== meetingId);
    setMeetings(updated);
    try {
      localStorage.setItem('migalia_scheduled_meetings', JSON.stringify(updated));
      await supabase.from('tasks').upsert({
        id: 'meta-meetings-calendar',
        title: 'Calendario de Sesiones de Socios',
        description: 'Reuniones programadas sincronizadas en la nube',
        status: 'done',
        priority: 'medium',
        assigned_to: currentPartner?.id || 'partner-1',
        category: 'General',
        subtasks: updated,
      });
      supabase.channel('migalia_presence').send({
        type: 'broadcast',
        event: 'data_changed',
        payload: { entity: 'meetings' },
      });
    } catch (e) {}
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
          onOpenChat={() => {
            setIsChatOpen(true);
            setUnreadChatCount(0);
          }}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onLaunchStudio={() => {
            // Emitir evento de llamada a otros socios conectados
            try {
              supabase.channel('migalia_presence').send({
                type: 'broadcast',
                event: 'incoming_call',
                payload: {
                  callerId: currentPartner?.id,
                  callerName: currentPartner?.name || 'Mario',
                  meetingTitle: 'Sesión Estratégica & Acuerdos Migalia',
                },
              });
            } catch (e) {}
            setIsGlobalMeetingOpen(true);
          }}
          unreadCount={unreadChatCount}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      </div>

      <div className="flex-1 flex flex-col md:flex-row print:block">
        {/* Sidebar Sticky */}
        <div className="print:hidden shrink-0 md:sticky md:top-[61px] md:h-[calc(100vh-61px)] z-30">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
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
                onGoToTab={handleTabChange}
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
              onSyncDocuments={handleSyncDocuments}
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
              currentPartnerName={currentPartner?.name || 'Mario'}
              onSaveToLogbook={handleAddLogbookEntry}
              onSaveDocument={handleSaveDocument}
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
        isMinimized={isChatMinimized}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
        onClose={() => setIsChatOpen(false)}
        currentPartner={currentPartner}
        partners={partners}
        messages={chatMessages}
        onSendMessage={async (newMsg) => {
          setChatMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id);
            if (exists) return prev;
            const updated = [...prev, newMsg];
            try {
              localStorage.setItem('migalia_partners_chat', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });

          // Transmitir por el canal dedicado de chat (más confiable que el canal de presencia)
          try {
            if (chatChannelRef.current) {
              chatChannelRef.current.send({
                type: 'broadcast',
                event: 'new_chat_message',
                payload: newMsg,
              });
            }
          } catch (e) {}

          // Persistir en Supabase de forma segura leyendo los mensajes más recientes para no sobrescribir mensajes concurrentes
          try {
            const { data: latestChatTask } = await supabase
              .from('tasks')
              .select('*')
              .eq('id', 'meta-chat-history')
              .maybeSingle();

            const existingList = Array.isArray(latestChatTask?.subtasks) ? latestChatTask.subtasks : [];
            const map = new Map();
            existingList.forEach((m: any) => { if (m?.id) map.set(m.id, m); });
            map.set(newMsg.id, newMsg);
            const finalList = Array.from(map.values());

            await supabase.from('tasks').upsert({
              id: 'meta-chat-history',
              title: 'Chat Interno de Socios',
              description: 'Historial de mensajes compartidos en la nube',
              status: 'done',
              priority: 'low',
              assigned_to: currentPartner?.id || 'partner-1',
              category: 'General',
              subtasks: finalList,
            });
          } catch (e) {
            console.error('Error syncing chat to cloud:', e);
          }
        }}
        onLaunchMeeting={(title) => {
          setIsChatOpen(false);
          setActiveMeetingData(title ? { title } : null);
          // Notificar llamada
          sendBroadcast('incoming_call', {
            callerId: currentPartner?.id,
            callerName: currentPartner?.name || 'Mario',
            meetingTitle: title || 'Sesión de Acuerdos',
          });
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

      {/* Sala de Sesión WebRTC Nativa (Migalia Calls Studio) con Miga AI y PIP */}
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

      {/* Buscador Global Inteligente (Ctrl + K / Raycast Spotlight) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tasks={tasks}
        recipes={recipes}
        logbook={logbook}
        documents={documents}
        onNavigate={(tab, targetId) => {
          handleTabChange(tab);
          if (targetId && tab === 'tasks') {
            const found = tasks.find((t) => t.id === targetId);
            if (found) {
              setSelectedTask(found);
              setIsModalOpen(true);
            }
          } else if (targetId && tab === 'recipes') {
            const foundRec = recipes.find((r) => r.id === targetId);
            if (foundRec) {
              setSelectedRecipe(foundRec);
              setIsRecipeModalOpen(true);
            }
          }
        }}
      />

      {/* Toast de Notificación de Chat Entrante (Visible si el chat está cerrado o minimizado) */}
      {chatNotification && (!isChatOpen || isChatMinimized) && (
        <ChatToast
          notification={chatNotification}
          onOpenChat={() => {
            setIsChatOpen(true);
            setIsChatMinimized(false);
            setUnreadChatCount(0);
            setChatNotification(null);
          }}
          onDismiss={() => setChatNotification(null)}
        />
      )}

      {/* Toast con Sonido de Llamada Entrante */}
      {incomingCall && !isGlobalMeetingOpen && (
        <IncomingCallToast
          callerName={incomingCall.callerName}
          meetingTitle={incomingCall.meetingTitle}
          onAccept={() => {
            setActiveMeetingData({ title: incomingCall.meetingTitle || 'Sesión de Acuerdos' });
            setIncomingCall(null);
            setIsGlobalMeetingOpen(true);
          }}
          onReject={() => {
            setIncomingCall(null);
          }}
        />
      )}
    </div>
  );
}

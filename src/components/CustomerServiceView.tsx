'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CustomerConversation,
  CustomerMessage,
  Partner,
  Task,
} from '@/types';
import {
  Search,
  Send,
  Phone,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Tag,
  User,
  ShoppingBag,
  Paperclip,
  Check,
  CheckCheck,
  RefreshCw,
  HelpCircle,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkle,
  ArrowRight,
} from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface CustomerServiceViewProps {
  conversations: CustomerConversation[];
  messages: Record<string, CustomerMessage[]>;
  currentPartner: Partner | null;
  onSendMessage: (conversationId: string, content: string) => void;
  onUpdateConversationStatus: (
    conversationId: string,
    status: CustomerConversation['status'],
    notes?: string,
    quotedAmount?: number
  ) => void;
  onConvertToTask: (conversation: CustomerConversation) => void;
  onNewConversation?: (newConv: CustomerConversation, initialMsg?: string) => void;
}

export const CustomerServiceView: React.FC<CustomerServiceViewProps> = ({
  conversations,
  messages,
  currentPartner,
  onSendMessage,
  onUpdateConversationStatus,
  onConvertToTask,
  onNewConversation,
}) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [editingQuote, setEditingQuote] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Nuevo prospecto / chat manual
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerHandle, setNewCustomerHandle] = useState('');
  const [newCategory, setNewCategory] = useState<CustomerConversation['category']>('Cotización de Pastel');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || conversations[0] || null;
  }, [conversations, selectedId]);

  const activeMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages[activeConversation.id] || [];
  }, [messages, activeConversation]);

  // Sincronizar campos de edición al cambiar de conversación activa
  useEffect(() => {
    if (activeConversation) {
      setEditingNotes(activeConversation.notes || '');
      setEditingQuote(activeConversation.quotedAmount ? String(activeConversation.quotedAmount) : '');
    }
  }, [activeConversation?.id]);

  // Scroll al final al recibir o mandar mensaje
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeMessages.length, selectedId]);

  // Filtrado de conversaciones
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.customerName.toLowerCase().includes(q);
        const matchHandle = c.customerHandle.toLowerCase().includes(q);
        const matchLast = c.lastMessage.toLowerCase().includes(q);
        const matchCategory = c.category?.toLowerCase().includes(q);
        if (!matchName && !matchHandle && !matchLast && !matchCategory) return false;
      }
      return true;
    });
  }, [conversations, filterStatus, searchQuery]);

  const handleSend = () => {
    if (!newMessageText.trim() || !activeConversation) return;
    onSendMessage(activeConversation.id, newMessageText.trim());
    setNewMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Respuestas Rápidas Gastronómicas de Migalia
  const quickReplies = [
    {
      title: '🥐 Catálogo & Dips',
      text: '¡Hola! Nuestras Cookie Fries se sirven con 3 dips insignia: Frutos Rojos con Maracuyá, Dulce de Leche y Crema de Avellana Piamonte.',
    },
    {
      title: '🎂 Cotización Eventos',
      text: 'Para eventos y barras de postres contamos con paquetes desde 50 personas que incluyen montaje artesanal, conos marfil y salsas al momento.',
    },
    {
      title: '📍 Horarios y Ubicación',
      text: 'Nuestra boutique y taller en Puebla abre de Martes a Domingo de 9:00 AM a 8:00 PM. ¡Será un gusto recibirte!',
    },
    {
      title: '💳 Anticipos y Pagos',
      text: 'Para apartar la fecha de tu pedido solicitamos un anticipo del 50% vía transferencia BBVA o pago con tarjeta. ¿Te comparto la cuenta CLABE?',
    },
  ];

  const handleApplyQuickReply = (text: string) => {
    setNewMessageText((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSaveNotesAndQuote = () => {
    if (!activeConversation) return;
    const parsedQuote = editingQuote ? parseFloat(editingQuote) : undefined;
    onUpdateConversationStatus(
      activeConversation.id,
      activeConversation.status,
      editingNotes,
      parsedQuote
    );
  };

  const handleCreateManualChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerHandle.trim()) return;

    const newId = `conv-${Date.now()}`;
    const cleanHandle = newCustomerHandle.startsWith('@')
      ? newCustomerHandle.trim()
      : `@${newCustomerHandle.trim()}`;

    const newConv: CustomerConversation = {
      id: newId,
      platform: 'instagram',
      customerHandle: cleanHandle,
      customerName: newCustomerName.trim(),
      lastMessage: newInitialMsg.trim() || 'Conversación iniciada desde el panel.',
      lastMessageTime: 'Ahora',
      unreadCount: 0,
      status: 'pending',
      category: newCategory,
      assignedTo: currentPartner?.id || 'partner-1',
      createdAt: new Date().toISOString().split('T')[0],
      tags: [newCategory || 'General', 'Instagram'],
    };

    if (onNewConversation) {
      onNewConversation(newConv, newInitialMsg.trim());
    }
    setSelectedId(newId);
    setShowNewModal(false);
    setNewCustomerName('');
    setNewCustomerHandle('');
    setNewInitialMsg('');
  };

  const simulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const getStatusBadge = (status: CustomerConversation['status']) => {
    switch (status) {
      case 'pending':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Por Responder</span>;
      case 'in_progress':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">En Conversación</span>;
      case 'quote_sent':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">Cotizado</span>;
      case 'order_confirmed':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Pedido Confirmado</span>;
      case 'resolved':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">Resuelto / Concluido</span>;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Header Superior del Módulo */}
      <div className="bg-white rounded-2xl border border-[#E6DFD5] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] flex items-center justify-center text-white shadow-xs">
            <InstagramIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-serif text-[#221F1D]">
                Atención a Clientes & Mensajería
              </h1>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 uppercase border border-pink-200">
                Instagram DMs · CRM
              </span>
            </div>
            <p className="text-xs text-[#6E665D]">
              Monitorea prospectos, cotiza eventos y convierte mensajes de Instagram en pedidos para el Kanban de Migalia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://www.instagram.com/migaliab/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-linear-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white hover:opacity-90 transition-opacity shadow-xs"
            title="Abrir perfil oficial de Migalia en Instagram"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>@migaliab</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => setShowConnectModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-pink-300 bg-pink-50 hover:bg-pink-100 text-pink-800 transition-colors"
            title="Vincular cuenta oficial de Instagram Direct (Meta API)"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>Vincular Instagram Real</span>
          </button>

          <button
            onClick={simulateSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#E6DFD5] bg-[#F8F6F0] hover:bg-stone-200 text-[#221F1D] transition-colors"
            title="Sincronizar bandeja con Meta Graph API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-pink-600' : 'text-stone-600'}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Actualizar DMs'}</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#221F1D] text-amber-400 hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Prospecto</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: 3 Columnas (Lista de Chats, Conversación Activa, Ficha de Cliente/Pedido) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* COLUMNA 1: LISTA DE CONVERSACIONES (4 cols en lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E6DFD5] flex flex-col overflow-hidden shadow-xs">
          {/* Barra de búsqueda y filtros */}
          <div className="p-3 border-b border-[#E6DFD5] space-y-2 shrink-0 bg-[#FDFCFA]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, handle o mensaje..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E6DFD5] bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-[#221F1D]"
              />
            </div>

            {/* Píldoras de filtro por estado de atención */}
            <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  filterStatus === 'all'
                    ? 'bg-[#221F1D] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Todos ({conversations.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  filterStatus === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Por Responder
              </button>
              <button
                onClick={() => setFilterStatus('quote_sent')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  filterStatus === 'quote_sent'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                }`}
              >
                Cotizados
              </button>
              <button
                onClick={() => setFilterStatus('order_confirmed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  filterStatus === 'order_confirmed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Confirmados
              </button>
            </div>
          </div>

          {/* Lista scrollable de conversaciones */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E6DFD5]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-stone-400 flex flex-col items-center justify-center">
                <MessageSquare className="w-8 h-8 stroke-1 mb-2 text-stone-300" />
                <p className="text-xs">No se encontraron conversaciones con los filtros aplicados.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-amber-50/60 border-l-4 border-amber-600' : 'hover:bg-stone-50'
                    }`}
                  >
                    {/* Avatar con badge de red social */}
                    <div className="relative shrink-0">
                      {conv.customerAvatar ? (
                        <img
                          src={conv.customerAvatar}
                          alt={conv.customerName}
                          className="w-10 h-10 rounded-full object-cover border border-[#E6DFD5]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs">
                          {conv.customerName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] shadow-xs bg-linear-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045]">
                        <InstagramIcon className="w-2.5 h-2.5" />
                      </div>
                    </div>

                    {/* Datos del chat */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-semibold text-[#221F1D] truncate">
                          {conv.customerName}
                        </h4>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-pink-700">{conv.customerHandle}</span>
                        {conv.category && (
                          <span className="truncate text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                            {conv.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-1">
                        {conv.lastMessage}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        {getStatusBadge(conv.status)}
                        {conv.quotedAmount && (
                          <span className="text-[10px] font-mono font-bold text-stone-700">
                            ${conv.quotedAmount.toLocaleString('es-MX')} MXN
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA 2: VENTANA DE CHAT ACTIVA (5 cols en lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E6DFD5] flex flex-col overflow-hidden shadow-xs">
          {activeConversation ? (
            <>
              {/* Header de la conversación */}
              <div className="p-3.5 border-b border-[#E6DFD5] flex items-center justify-between bg-[#FDFCFA] shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    {activeConversation.customerAvatar ? (
                      <img
                        src={activeConversation.customerAvatar}
                        alt={activeConversation.customerName}
                        className="w-9 h-9 rounded-full object-cover border border-[#E6DFD5]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                        {activeConversation.customerName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#221F1D] truncate flex items-center gap-1.5">
                      {activeConversation.customerName}
                      <span className="text-[10px] font-mono font-normal text-pink-600">
                        {activeConversation.customerHandle}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                      <span className="capitalize">{activeConversation.platform} DM</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">Activo</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={activeConversation.status}
                    onChange={(e) =>
                      onUpdateConversationStatus(
                        activeConversation.id,
                        e.target.value as CustomerConversation['status'],
                        activeConversation.notes,
                        activeConversation.quotedAmount
                      )
                    }
                    className="text-[11px] font-medium py-1 px-2 rounded-lg border border-[#E6DFD5] bg-white text-[#221F1D] focus:outline-hidden"
                  >
                    <option value="pending">Por Responder</option>
                    <option value="in_progress">En Conversación</option>
                    <option value="quote_sent">Cotizado</option>
                    <option value="order_confirmed">Pedido Confirmado</option>
                    <option value="resolved">Resuelto / Concluido</option>
                  </select>
                </div>
              </div>

              {/* Hilo de Mensajes */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FBF9F5]/50"
              >
                <div className="text-center my-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-200/60 text-stone-600">
                    Mensajes directos de {activeConversation.platform === 'instagram' ? 'Instagram' : 'WhatsApp'}
                  </span>
                </div>

                {activeMessages.length === 0 ? (
                  <div className="text-center py-10 text-stone-400 text-xs">
                    Inicia la conversación con este prospecto de Migalia.
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isAgent = msg.sender === 'agent';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-medium text-stone-500">
                            {msg.senderName}
                          </span>
                          <span className="text-[9px] text-stone-400">{msg.timestamp}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                            isAgent
                              ? 'bg-[#221F1D] text-[#F8F6F0] rounded-br-xs'
                              : 'bg-white text-stone-800 border border-[#E6DFD5] rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {isAgent && (
                          <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-stone-400">
                            <CheckCheck className="w-3 h-3 text-amber-600" />
                            <span>Entregado</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Respuestas rápidas integradas */}
              <div className="px-3 pt-2 pb-1 border-t border-[#E6DFD5] bg-[#FDFCFA] overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Respuestas Rápidas:
                </span>
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyQuickReply(qr.text)}
                    className="text-[10px] font-medium px-2 py-1 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 transition-colors shrink-0"
                  >
                    {qr.title}
                  </button>
                ))}
              </div>

              {/* Barra de envío de mensaje */}
              <div className="p-3 border-t border-[#E6DFD5] bg-white shrink-0 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Responder a ${activeConversation.customerName} como Migalia...`}
                  className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-[#E6DFD5] bg-[#F8F6F0] focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-[#221F1D]"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessageText.trim()}
                  className="p-2 rounded-xl bg-[#221F1D] text-amber-400 hover:bg-stone-800 disabled:opacity-40 disabled:hover:bg-[#221F1D] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-stone-400">
              <MessageSquare className="w-12 h-12 stroke-1 mb-2 text-stone-300" />
              <p className="text-xs">Selecciona una conversación para interactuar.</p>
            </div>
          )}
        </div>

        {/* COLUMNA 3: FICHA DE PROSPECTO, COTIZACIÓN & CONVERSIÓN A KANBAN (3 cols en lg) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E6DFD5] flex flex-col overflow-hidden shadow-xs">
          {activeConversation ? (
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {/* Perfil del Cliente */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Ficha de Contacto
                </span>
                <div className="mt-2 p-3 rounded-xl bg-[#F8F6F0] border border-[#E6DFD5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#221F1D]">{activeConversation.customerName}</span>
                    <a
                      href={`https://instagram.com/${activeConversation.customerHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-pink-700 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Ver perfil en IG</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="text-[11px] text-stone-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-stone-500">Usuario IG:</span>
                      <span className="font-semibold text-pink-800">{activeConversation.customerHandle}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500">Canal:</span>
                      <span className="font-medium text-stone-700">Instagram Direct Message</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Conversión Rápida a Pedido Kanban */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold text-amber-900">
                    Convertir en Tarea / Pedido
                  </h4>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Crea automáticamente una tarjeta en el tablero <strong>Kanban</strong> con los requerimientos y cotización de este cliente.
                </p>
                <button
                  onClick={() => onConvertToTask(activeConversation)}
                  className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Pedido en Kanban</span>
                </button>
              </div>

              {/* Cotización Estimada */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Monto Cotizado (MXN)
                </span>
                <div className="mt-1 relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="number"
                    value={editingQuote}
                    onChange={(e) => setEditingQuote(e.target.value)}
                    placeholder="Ej. 1450"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold rounded-xl border border-[#E6DFD5] bg-[#F8F6F0] focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-[#221F1D]"
                  />
                </div>
              </div>

              {/* Notas Internas de Mario & Susy */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Notas de Pedido & Evento
                </span>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Detalles de sabores, fecha de entrega, anticipos..."
                  className="mt-1 w-full p-2.5 text-xs rounded-xl border border-[#E6DFD5] bg-[#F8F6F0] focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-[#221F1D]"
                />
                <button
                  onClick={handleSaveNotesAndQuote}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg border border-[#E6DFD5] bg-white hover:bg-stone-100 text-stone-800 text-[11px] font-semibold transition-colors"
                >
                  Guardar Ficha
                </button>
              </div>

              {/* Tags del prospecto */}
              {activeConversation.tags && activeConversation.tags.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Etiquetas
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {activeConversation.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-stone-400 text-xs flex items-center justify-center flex-1">
              Sin prospecto seleccionado.
            </div>
          )}
        </div>
      </div>

      {/* MODAL REGISTRAR PROSPECTO O NUEVO CHAT */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#E6DFD5] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-3">
              <h3 className="text-sm font-bold font-serif text-[#221F1D] flex items-center gap-2">
                <InstagramIcon className="w-4 h-4 text-pink-600" />
                <span>Registrar Prospecto de Instagram / Mensajería</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateManualChat} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Ej. Sofía Montes"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6DFD5] bg-[#F8F6F0] focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Usuario de Instagram (@handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-stone-400">@</span>
                  <input
                    type="text"
                    required
                    value={newCustomerHandle.replace(/^@/, '')}
                    onChange={(e) => setNewCustomerHandle(e.target.value)}
                    placeholder="sofia_montes"
                    className="w-full text-xs pl-7 pr-3 py-2 rounded-xl border border-[#E6DFD5] bg-[#F8F6F0] focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Tipo de Inquietud / Categoría
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6DFD5] bg-[#F8F6F0] focus:outline-hidden"
                >
                  <option value="Cotización de Pastel">Cotización de Pastel</option>
                  <option value="Pedido Evento">Pedido Evento</option>
                  <option value="Duda Menú & Alérgenos">Duda Menú & Alérgenos</option>
                  <option value="Horarios & Ubicación">Horarios & Ubicación</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Mensaje Inicial o Petición por Instagram
                </label>
                <textarea
                  rows={3}
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  placeholder="Mensaje recibido en el DM de @migaliab..."
                  className="w-full text-xs p-3 rounded-xl border border-[#E6DFD5] bg-[#F8F6F0] focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6DFD5]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#221F1D] text-amber-400 hover:bg-stone-800 shadow-xs"
                >
                  Registrar e Iniciar Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CÓMO VINCULAR INSTAGRAM REAL (@migaliab) */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E6DFD5] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] flex items-center justify-center text-white">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif text-[#221F1D]">
                    Conexión Directa con Instagram Oficial
                  </h3>
                  <a
                    href="https://www.instagram.com/migaliab/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-pink-700 hover:underline flex items-center gap-1 font-mono font-medium"
                  >
                    <span>@migaliab</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
              <p className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                Para que los DMs que lleguen a <strong>@migaliab</strong> aparezcan automáticamente aquí en tiempo real, Meta (Facebook/Instagram) requiere autorizar la <strong>Instagram Graph API</strong>.
              </p>

              <h4 className="font-bold text-[#221F1D] text-xs uppercase tracking-wider">
                Pasos de Conexión Oficial (Meta for Developers):
              </h4>

              <ol className="space-y-2 list-decimal list-inside text-stone-600">
                <li className="p-2 rounded-lg bg-[#F8F6F0]">
                  <strong>1. Tipo de cuenta:</strong> Verifica que <a href="https://www.instagram.com/migaliab/" target="_blank" rel="noopener noreferrer" className="text-pink-700 font-semibold underline">@migaliab</a> esté configurada como cuenta <strong>Profesional (Business / Creador)</strong> en la app de Instagram (Configuración &gt; Tipo de cuenta).
                </li>
                <li className="p-2 rounded-lg bg-[#F8F6F0]">
                  <strong>2. Conectar con Facebook Page:</strong> Vincular la cuenta de Instagram con la Página de Facebook oficial de Migalia en Meta Business Suite.
                </li>
                <li className="p-2 rounded-lg bg-[#F8F6F0]">
                  <strong>3. Habilitar Acceso a Mensajes:</strong> En la app de Instagram en tu teléfono:
                  <div className="mt-1 text-[11px] text-stone-500 font-sans">
                    Configuración &gt; Mensajes y respuestas a historias &gt; Controles de mensajes &gt; Activar <strong>"Permitir acceso a los mensajes"</strong>.
                  </div>
                </li>
                <li className="p-2 rounded-lg bg-[#F8F6F0]">
                  <strong>4. Meta Webhook / Token:</strong> Con tu App de <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-semibold">developers.facebook.com</a>, suscríbete al webhook de <code>messages</code> y <code>messaging_postbacks</code>.
                </li>
              </ol>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-stone-800 text-[11px]">¿Quieres que lo configuremos directo vía Webhook?</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Listo en Backend</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  El panel ya tiene la estructura lista para recibir los mensajes entrantes vía webhook en <code>/api/instagram/webhook</code> y guardarlos directo en Supabase.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E6DFD5]">
              <a
                href="https://www.instagram.com/direct/inbox/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-pink-700 hover:underline flex items-center gap-1"
              >
                <span>Abrir Instagram Web Inbox</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#221F1D] text-amber-400 hover:bg-stone-800 shadow-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { 
  Trash2, RotateCcw, AlertTriangle, Search, Filter, 
  Utensils, CheckSquare, FileText, BookOpen, Flag, Calendar,
  Clock, User, X
} from 'lucide-react';
import { TrashedItem } from '@/types';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashedItems: TrashedItem[];
  onRestoreItem: (item: TrashedItem) => Promise<void> | void;
  onPermanentDeleteItem: (itemId: string) => Promise<void> | void;
  onEmptyTrash: () => Promise<void> | void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({
  isOpen,
  onClose,
  trashedItems,
  onRestoreItem,
  onPermanentDeleteItem,
  onEmptyTrash,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = (trashedItems || []).filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deletedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const getItemIcon = (type: TrashedItem['type']) => {
    switch (type) {
      case 'recipe':
        return <Utensils className="w-4 h-4 text-[#C27A56]" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-[#3B82F6]" />;
      case 'document':
        return <FileText className="w-4 h-4 text-[#10B981]" />;
      case 'logbook':
        return <BookOpen className="w-4 h-4 text-[#8B5CF6]" />;
      case 'milestone':
        return <Flag className="w-4 h-4 text-[#F59E0B]" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-[#EC4899]" />;
      default:
        return <Trash2 className="w-4 h-4 text-[#7A7067]" />;
    }
  };

  const getTypeLabel = (type: TrashedItem['type']) => {
    switch (type) {
      case 'recipe': return 'Receta';
      case 'task': return 'Actividad / Tarea';
      case 'document': return 'Documento';
      case 'logbook': return 'Bitácora';
      case 'milestone': return 'Hito';
      case 'meeting': return 'Reunión';
      default: return 'Elemento';
    }
  };

  const handleRestore = async (item: TrashedItem) => {
    setProcessingId(item.id);
    try {
      await onRestoreItem(item);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePermanentDelete = async (itemId: string) => {
    if (!confirm('¿Eliminar permanentemente este elemento? No se podrá recuperar.')) return;
    setProcessingId(itemId);
    try {
      await onPermanentDeleteItem(itemId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEmpty = async () => {
    await onEmptyTrash();
    setConfirmEmpty(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl w-full max-w-4xl shadow-2xl border border-[#D9CEBF]/40 dark:border-white/10 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#D9CEBF]/30 dark:border-white/10 flex items-center justify-between bg-[#FAF8F5] dark:bg-[#252525]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C27A56]/15 flex items-center justify-center text-[#C27A56]">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2A2421] dark:text-[#EAE6DF] flex items-center gap-2">
                Papelera de Reciclaje
                <span className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#C27A56]/15 text-[#C27A56]">
                  {trashedItems?.length || 0} {trashedItems?.length === 1 ? 'elemento' : 'elementos'}
                </span>
              </h2>
              <p className="text-xs text-[#7A7067] dark:text-[#A8A199]">
                Los elementos borrados por Mario o Susy se resguardan aquí para restaurarlos en cualquier momento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {trashedItems.length > 0 && !confirmEmpty && (
              <button
                onClick={() => setConfirmEmpty(true)}
                className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar Papelera
              </button>
            )}

            {confirmEmpty && (
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-xl border border-red-200 dark:border-red-800">
                <span className="text-xs font-medium text-red-700 dark:text-red-300">¿Vaciar todo?</span>
                <button
                  onClick={handleEmpty}
                  className="px-2 py-0.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                >
                  Sí, vaciar
                </button>
                <button
                  onClick={() => setConfirmEmpty(false)}
                  className="px-2 py-0.5 text-xs text-[#7A7067] hover:bg-white/60 dark:hover:bg-white/10 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7A7067] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search and Filter */}
        <div className="px-6 py-3 border-b border-[#D9CEBF]/20 dark:border-white/5 bg-white dark:bg-[#1E1E1E] flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#7A7067]" />
            <input
              type="text"
              placeholder="Buscar por título o socio que eliminó..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D9CEBF]/40 dark:border-white/10 bg-[#FAF8F5]/60 dark:bg-[#2A2A2A] text-xs focus:outline-none focus:ring-2 focus:ring-[#C27A56] dark:text-[#EAE6DF]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-3.5 h-3.5 text-[#7A7067]" />
            {[
              { id: 'all', label: 'Todos' },
              { id: 'recipe', label: 'Recetas' },
              { id: 'task', label: 'Actividades' },
              { id: 'document', label: 'Documentos' },
              { id: 'logbook', label: 'Bitácora' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterType === tab.id
                    ? 'bg-[#2A2421] text-white dark:bg-white dark:text-[#2A2421]'
                    : 'text-[#7A7067] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 divide-y divide-[#D9CEBF]/20 dark:divide-white/5">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] dark:bg-[#252525] border border-[#D9CEBF]/30 flex items-center justify-center text-[#7A7067]">
                <Trash2 className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-medium text-[#2A2421] dark:text-[#EAE6DF]">
                La papelera está vacía
              </p>
              <p className="text-xs text-[#7A7067] dark:text-[#A8A199] max-w-sm">
                Cuando Mario o Susy borren recetas, tareas o documentos, se resguardarán aquí para evitar pérdidas accidentales.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-[#FAF8F5]/80 dark:hover:bg-[#252525]/80 transition-colors group border border-transparent hover:border-[#D9CEBF]/40 dark:hover:border-white/10"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-[#D9CEBF]/30 dark:border-white/10 shadow-xs flex-shrink-0">
                    {getItemIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#2A2421]/5 dark:bg-white/10 text-[#7A7067] dark:text-[#A8A199]">
                        {getTypeLabel(item.type)}
                      </span>
                      <h3 className="text-sm font-semibold text-[#2A2421] dark:text-[#EAE6DF] truncate">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#7A7067] dark:text-[#A8A199]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.deletedAt).toLocaleString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.deletedBy && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Eliminado por: <strong className="text-[#2A2421] dark:text-[#EAE6DF]">{item.deletedBy}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={processingId === item.id}
                    className="px-3 py-1.5 rounded-xl bg-[#2A2421] hover:bg-[#3D3530] text-white dark:bg-[#C27A56] dark:hover:bg-[#A86443] text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    title="Restaurar elemento"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${processingId === item.id ? 'animate-spin' : ''}`} />
                    <span>Restaurar</span>
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(item.id)}
                    disabled={processingId === item.id}
                    className="p-1.5 rounded-xl text-[#7A7067] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                    title="Eliminar definitivamente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAF8F5] dark:bg-[#252525] border-t border-[#D9CEBF]/30 dark:border-white/10 flex items-center justify-between text-xs text-[#7A7067] dark:text-[#A8A199]">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#C27A56]" />
            <span>Al restaurar, el elemento vuelve inmediatamente a su sección y se sincroniza en vivo para ambos socios.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#D9CEBF]/60 dark:border-white/10 hover:bg-white dark:hover:bg-[#1E1E1E] text-[#2A2421] dark:text-[#EAE6DF] font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
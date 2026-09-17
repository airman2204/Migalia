'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, FolderKanban, ChefHat, Files, BookOpen, Calendar, ArrowRight, X } from 'lucide-react';
import { Task, Recipe, LogbookEntry, MigaliaDocument } from '@/types';
import { ActiveTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  recipes: Recipe[];
  logbook: LogbookEntry[];
  documents: MigaliaDocument[];
  onNavigate: (tab: ActiveTab, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  recipes,
  logbook,
  documents,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Manejar Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const found: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: 'task' | 'recipe' | 'logbook' | 'document';
      tab: ActiveTab;
    }> = [];

    // 1. Buscar en Tareas
    tasks.forEach((t) => {
      if (
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
      ) {
        found.push({
          id: t.id,
          title: t.title,
          subtitle: `Actividad · ${t.category} · Estado: ${t.status}`,
          category: 'task',
          tab: 'tasks',
        });
      }
    });

    // 2. Buscar en Recetas e Ingredientes
    recipes.forEach((r) => {
      const matchIngredients = r.ingredients?.some((ing) => (ing.name || '').toLowerCase().includes(q));
      const categoryStr = r.category || 'Receta';
      const costTotal = r.ingredients?.reduce((acc, i) => acc + (i.totalCost || 0), 0) || 0;

      if (
        (r.title || '').toLowerCase().includes(q) ||
        categoryStr.toLowerCase().includes(q) ||
        matchIngredients
      ) {
        found.push({
          id: r.id,
          title: r.title,
          subtitle: `Receta · ${categoryStr} · Costo Lote: $${costTotal.toFixed(2)}`,
          category: 'recipe',
          tab: 'recipes',
        });
      }
    });

    // 3. Buscar en Bitácora & Minutas
    logbook.forEach((l) => {
      if ((l.title || '').toLowerCase().includes(q) || (l.content || '').toLowerCase().includes(q)) {
        found.push({
          id: l.id,
          title: l.title,
          subtitle: `Minuta & Bitácora · ${l.date} · ${l.authorName}`,
          category: 'logbook',
          tab: 'logbook',
        });
      }
    });

    // 4. Buscar en Documentos
    documents.forEach((d) => {
      const folderStr = d.folder || 'Documentos';
      if (d.title.toLowerCase().includes(q) || folderStr.toLowerCase().includes(q)) {
        found.push({
          id: d.id,
          title: d.title,
          subtitle: `Documento · ${folderStr} · ${d.authorName || 'Migalia'}`,
          category: 'document',
          tab: 'documents',
        });
      }
    });

    return found.slice(0, 10);
  }, [query, tasks, recipes, logbook, documents]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-start justify-center p-4 sm:pt-24 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Input con Icono */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-150">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar actividades, recetas, ingredientes, minutas o documentos..."
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
            ESC
          </span>
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-stone-400">
              <p className="text-xs font-medium">Escribe algo para comenzar a buscar.</p>
              <div className="flex justify-center gap-2 mt-3 text-[11px] text-stone-500">
                <span className="px-2 py-1 bg-stone-100 rounded-lg">Ej: "Horno"</span>
                <span className="px-2 py-1 bg-stone-100 rounded-lg">Ej: "Cookie Fries"</span>
                <span className="px-2 py-1 bg-stone-100 rounded-lg">Ej: "Notaría"</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <p className="text-xs">No se encontraron coincidencias para "{query}".</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => {
                    onNavigate(item.tab, item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 text-left transition group border border-transparent hover:border-stone-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-2 rounded-xl bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
                      {item.category === 'task' && <FolderKanban className="w-4 h-4" />}
                      {item.category === 'recipe' && <ChefHat className="w-4 h-4" />}
                      {item.category === 'logbook' && <BookOpen className="w-4 h-4" />}
                      {item.category === 'document' && <Files className="w-4 h-4" />}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-amber-900">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-stone-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-stone-300 group-hover:text-stone-600 transition shrink-0 pl-2">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-150 flex items-center justify-between text-[10px] text-stone-400">
          <span>Búsqueda global inteligente Migalia</span>
          <span className="flex items-center gap-1">
            <span>Navega con</span> <strong className="font-mono text-stone-600">Enter</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

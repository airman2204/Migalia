'use client';

import React, { useState, useMemo } from 'react';
import { MigaliaDocument, DocumentFolder, DocumentType } from '@/types';
import {
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Plus,
  Search,
  Folder,
  Trash2,
  ExternalLink,
  X,
  Calendar,
  User,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
  Pin,
  Check,
  Loader2,
} from 'lucide-react';

interface DocumentsViewProps {
  documents: MigaliaDocument[];
  currentPartnerName: string;
  onSaveDocument: (doc: MigaliaDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

const FOLDERS: DocumentFolder[] = [
  'Finanzas & Inversión',
  'Operaciones & Taller',
  'Legal & Constitución',
  'Branding & Mercadotecnia',
  'General',
];

export const MIGALIA_DRIVE_FOLDER_ID = '1al1p0uWP2Lwc7Z1pvgKGyJwoHWlNiViO';
export const MIGALIA_DRIVE_URL = `https://drive.google.com/drive/u/0/folders/${MIGALIA_DRIVE_FOLDER_ID}`;

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  currentPartnerName,
  onSaveDocument,
  onDeleteDocument,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'sheets' | 'docs'>('all');
  const [selectedFolder, setSelectedFolder] = useState<'all' | DocumentFolder>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal rápido de creación: solo pide título y categoría
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'google_sheet' | 'google_doc'>('google_sheet');
  const [createTitle, setCreateTitle] = useState('');
  const [createFolder, setCreateFolder] = useState<DocumentFolder>('Finanzas & Inversión');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal para ver/editar un documento existente
  const [editingDoc, setEditingDoc] = useState<MigaliaDocument | null>(null);
  const [editUrl, setEditUrl] = useState('');

  // Filtrado reactivo por tipo de recurso y búsqueda
  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = documents.filter((d) => {
      // Filtro por pestaña de tipo
      if (activeMainTab === 'sheets') {
        if (d.type !== 'google_sheet' && d.type !== 'sheet') return false;
      } else if (activeMainTab === 'docs') {
        if (d.type !== 'google_doc' && d.type !== 'doc') return false;
      }

      // Filtro por carpeta
      const matchFolder = selectedFolder === 'all' || d.folder === selectedFolder;
      if (!matchFolder) return false;

      if (!term) return true;
      return (
        d.title.toLowerCase().includes(term) ||
        d.folder.toLowerCase().includes(term) ||
        (d.authorName || '').toLowerCase().includes(term)
      );
    });

    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });
  }, [documents, activeMainTab, selectedFolder, searchTerm]);

  // Contadores para pestañas
  const sheetsCount = useMemo(
    () => documents.filter((d) => d.type === 'google_sheet' || d.type === 'sheet').length,
    [documents]
  );
  const docsCount = useMemo(
    () => documents.filter((d) => d.type === 'google_doc' || d.type === 'doc').length,
    [documents]
  );

  const handleOpenCreate = (type: 'google_sheet' | 'google_doc') => {
    setCreateType(type);
    setCreateTitle('');
    setCreateFolder(
      selectedFolder !== 'all'
        ? selectedFolder
        : type === 'google_sheet'
        ? 'Finanzas & Inversión'
        : 'Legal & Constitución'
    );
    setCreateError(null);
    setIsCreating(false);
    setIsCreateModalOpen(true);
  };

  /**
   * Creación 100% Automática vía Google Drive API:
   * 1. Llama al endpoint /api/drive/create.
   * 2. Google Drive crea el archivo con su nombre oficial DENTRO de la carpeta de Migalia.
   * 3. Registra el documento en la base de datos con su URL real de Google.
   * 4. Abre el archivo recién creado directamente en una nueva pestaña.
   */
  const handleConfirmCreate = async () => {
    const title = createTitle.trim() || (createType === 'google_sheet' ? 'Nueva Hoja de Cálculo' : 'Nuevo Documento');
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/drive/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: createType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al crear archivo en Google Drive');
      }

      const newDoc: MigaliaDocument = {
        id: 'doc-' + Date.now(),
        title: data.name || title,
        type: createType,
        folder: createFolder,
        content: data.url,
        googleUrl: data.url,
        authorName: currentPartnerName || 'Mario',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isPinned: false,
      };

      onSaveDocument(newDoc);
      setIsCreateModalOpen(false);

      // Abrir directamente el documento recién creado en Google Drive
      window.open(data.url, '_blank');
    } catch (err: any) {
      console.error('Error al crear archivo en Google Drive:', err);
      setCreateError(err.message || 'No se pudo crear el archivo en Drive');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (doc: MigaliaDocument) => {
    setEditingDoc(doc);
    setCreateType(doc.type === 'google_doc' || doc.type === 'doc' ? 'google_doc' : 'google_sheet');
    setCreateTitle(doc.title);
    setCreateFolder(doc.folder);
    setEditUrl(doc.googleUrl || (doc.content?.startsWith('http') ? doc.content : ''));
  };

  const handleSaveEdit = () => {
    if (!editingDoc) return;
    const finalUrl = editUrl.trim();
    const updated: MigaliaDocument = {
      ...editingDoc,
      title: createTitle.trim() || editingDoc.title,
      folder: createFolder,
      type: createType,
      content: finalUrl || editingDoc.content,
      googleUrl: finalUrl || undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onSaveDocument(updated);
    setEditingDoc(null);
  };

  const handleTogglePin = (e: React.MouseEvent, doc: MigaliaDocument) => {
    e.stopPropagation();
    onSaveDocument({
      ...doc,
      isPinned: !doc.isPinned,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const getFolderBadge = (folder: DocumentFolder) => {
    switch (folder) {
      case 'Finanzas & Inversión':
        return (
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
            <TrendingUp className="w-3 h-3" /> Finanzas
          </span>
        );
      case 'Operaciones & Taller':
        return (
          <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
            <Layers className="w-3 h-3" /> Operaciones
          </span>
        );
      case 'Legal & Constitución':
        return (
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
            <ShieldCheck className="w-3 h-3" /> Legal
          </span>
        );
      case 'Branding & Mercadotecnia':
        return (
          <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
            <Sparkles className="w-3 h-3" /> Branding
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
            <Folder className="w-3 h-3" /> General
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Acciones y Pestañas de Archivos */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveMainTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMainTab === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <span>Todos los Archivos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeMainTab === 'all' ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('sheets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMainTab === 'sheets'
                ? 'bg-[#0F9D58] text-white shadow-xs'
                : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeMainTab === 'sheets' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {sheetsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('docs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMainTab === 'docs'
                ? 'bg-[#4285F4] text-white shadow-xs'
                : 'text-stone-600 hover:bg-blue-50 hover:text-blue-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Google Docs</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeMainTab === 'docs' ? 'bg-blue-800 text-blue-100' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {docsCount}
            </span>
          </button>
        </div>

        {/* Acciones directas */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <a
            href={MIGALIA_DRIVE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition"
            title="Abrir la carpeta oficial en Google Drive"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Abrir Drive Oficial</span>
            <ExternalLink className="w-3 h-3 text-amber-600" />
          </a>

          <button
            onClick={() => handleOpenCreate('google_sheet')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Google Sheet</span>
          </button>

          <button
            onClick={() => handleOpenCreate('google_doc')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Google Doc</span>
          </button>
        </div>
      </div>

      {/* Selector de Carpetas temáticas y Buscador */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedFolder === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Todas ({documents.length})
          </button>
          {FOLDERS.map((f) => {
            const count = documents.filter((d) => d.folder === f).length;
            const isSelected = selectedFolder === f;
            return (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{f}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-stone-800 text-emerald-400' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Cards de Documentos / Sheets */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-stone-800">No hay archivos en esta vista</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Crea o vincula tus Google Sheets o Google Docs oficiales clasificados por categoría.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => handleOpenCreate('google_sheet')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Google Sheet</span>
            </button>
            <button
              onClick={() => handleOpenCreate('google_doc')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Google Doc</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const isSheet = doc.type === 'google_sheet' || doc.type === 'sheet';
            const rawUrl = doc.googleUrl || (doc.content?.startsWith('http') ? doc.content : '');
            const hasValidLink = Boolean(rawUrl && rawUrl.startsWith('http'));

            return (
              <div
                key={doc.id}
                className={`group bg-white rounded-2xl border transition-all flex flex-col justify-between ${
                  doc.isPinned
                    ? isSheet
                      ? 'border-emerald-400/80 shadow-xs bg-gradient-to-b from-emerald-50/20 to-white'
                      : 'border-blue-400/80 shadow-xs bg-gradient-to-b from-blue-50/20 to-white'
                    : 'border-stone-200 hover:shadow-md hover:border-stone-300'
                } p-5`}
              >
                <div>
                  {/* Encabezado de la Card */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`p-2.5 rounded-xl border group-hover:scale-105 transition ${
                          isSheet
                            ? 'bg-emerald-50 border-emerald-100 text-[#0F9D58]'
                            : 'bg-blue-50 border-blue-100 text-[#4285F4]'
                        }`}
                      >
                        {isSheet ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </span>
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider block ${
                            isSheet ? 'text-[#0F9D58]' : 'text-[#4285F4]'
                          }`}
                        >
                          {isSheet ? 'Google Sheets' : 'Google Docs'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {hasValidLink ? 'Enlace Directo Activo' : 'Enlace pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleTogglePin(e, doc)}
                        className={`p-1.5 rounded-lg transition ${
                          doc.isPinned
                            ? 'text-amber-600 bg-amber-100/70 hover:bg-amber-100'
                            : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                        }`}
                        title={doc.isPinned ? 'Desfijar' : 'Fijar arriba'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {hasValidLink && (
                        <a
                          href={rawUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                          title="Abrir en pestaña nueva"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${doc.title}" del listado?`)) {
                            onDeleteDocument(doc.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Título: al hacer clic abre directamente el documento si tiene link, o permite editar */}
                  <h3
                    onClick={() => {
                      if (hasValidLink) {
                        window.open(rawUrl, '_blank');
                      } else {
                        handleOpenEdit(doc);
                      }
                    }}
                    className="font-serif font-bold text-stone-900 text-base leading-snug hover:text-emerald-700 cursor-pointer transition line-clamp-2"
                  >
                    {doc.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2">
                    {getFolderBadge(doc.folder)}
                    {doc.isPinned && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        📌 Fijado
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer y Acciones Rápidas */}
                <div className="mt-5 pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span className="font-medium text-stone-600">{doc.authorName || 'Mario'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{doc.updatedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition"
                    >
                      Ajustes
                    </button>
                    {hasValidLink ? (
                      <a
                        href={rawUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${
                          isSheet
                            ? 'bg-[#0F9D58] hover:bg-emerald-700 text-white'
                            : 'bg-[#4285F4] hover:bg-blue-600 text-white'
                        }`}
                      >
                        <span>Abrir Documento</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="flex-1 py-1.5 px-3 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-semibold transition"
                      >
                        Pegar enlace de Google
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL ÁGIL: SOLO PREGUNTA NOMBRE, CATEGORÍA Y TE LLEVA DIRECTO AL DOCUMENTO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6">
            {/* Header del modal */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <div className="flex items-center gap-2.5">
                <span
                  className={`p-2.5 rounded-xl ${
                    createType === 'google_sheet'
                      ? 'bg-emerald-50 text-[#0F9D58]'
                      : 'bg-blue-50 text-[#4285F4]'
                  }`}
                >
                  {createType === 'google_sheet' ? (
                    <FileSpreadsheet className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {createType === 'google_sheet' ? 'Nueva Hoja de Cálculo' : 'Nuevo Documento'}
                  </h3>
                  <span className="text-[11px] text-stone-400 font-medium">
                    Clasifícalo para tus filtros
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario rápido */}
            <div className="mt-5 space-y-4 text-xs">
              {/* 1. Nombre / Título */}
              <div>
                <label className="block font-bold text-stone-800 mb-1.5">
                  Nombre del archivo:
                </label>
                <input
                  type="text"
                  placeholder={
                    createType === 'google_sheet'
                      ? 'Ej. Costeo de Galletas, Presupuesto CAPEX...'
                      : 'Ej. Contrato de Arrendamiento, Manual de Marca...'
                  }
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition text-xs"
                  autoFocus
                />
              </div>

              {/* 2. Categoría / Filtro */}
              <div>
                <label className="block font-bold text-stone-800 mb-1.5">
                  Categoría para filtros:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FOLDERS.map((f) => {
                    const isSelected = createFolder === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setCreateFolder(f)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-xs font-semibold'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="truncate">{f}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 leading-relaxed">
                  ⚠️ {createError}
                </div>
              )}
            </div>

            {/* Botón de Confirmación y Creación */}
            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-stone-150">
              <button
                type="button"
                disabled={isCreating}
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold transition disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isCreating}
                onClick={handleConfirmCreate}
                className={`flex items-center gap-2 px-6 py-2 text-white rounded-xl text-xs font-bold transition shadow-sm ${
                  createType === 'google_sheet'
                    ? 'bg-[#0F9D58] hover:bg-emerald-700'
                    : 'bg-[#4285F4] hover:bg-blue-600'
                } disabled:opacity-75 disabled:cursor-wait`}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <span>Crear</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AJUSTES/EDICIÓN PARA ARCHIVO EXISTENTE */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-150">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Ajustar Documento
              </h3>
              <button
                onClick={() => setEditingDoc(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1.5">Título:</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1.5">Categoría / Carpeta:</label>
                <select
                  value={createFolder}
                  onChange={(e) => setCreateFolder(e.target.value as DocumentFolder)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs font-medium"
                >
                  {FOLDERS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1.5">Enlace de Google:</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs font-mono"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-2 pt-3 border-t border-stone-150">
              {editUrl && editUrl.startsWith('http') ? (
                <a
                  href={editUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Probar enlace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

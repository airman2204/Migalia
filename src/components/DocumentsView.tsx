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
  Save,
  X,
  Calendar,
  User,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle,
  Pin,
  HelpCircle,
  HardDrive,
  Eye,
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
// URL embebida oficial de Google Drive para visualización de carpetas en iframe
export const MIGALIA_DRIVE_EMBED_URL = `https://drive.google.com/embeddedfolderview?id=${MIGALIA_DRIVE_FOLDER_ID}#list`;

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  currentPartnerName,
  onSaveDocument,
  onDeleteDocument,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'sheets' | 'docs'>('all');
  const [selectedFolder, setSelectedFolder] = useState<'all' | DocumentFolder>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDoc, setActiveDoc] = useState<MigaliaDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Formulario simple: Título, Tipo (Sheets / Docs), Carpeta y URL
  const [itemTitle, setItemTitle] = useState('');
  const [itemType, setItemType] = useState<'google_sheet' | 'google_doc'>('google_sheet');
  const [itemFolder, setItemFolder] = useState<DocumentFolder>('Finanzas & Inversión');
  const [itemUrl, setItemUrl] = useState('');

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

  // Conversión de link para renderizado sin bloqueo en iframe
  const getEmbedUrl = (rawUrl: string, type: string) => {
    if (!rawUrl) return '';
    let url = rawUrl.trim();
    if (url.includes('/preview') || url.includes('/pubhtml')) {
      return url;
    }
    if (url.includes('docs.google.com/spreadsheets/d/') || url.includes('docs.google.com/document/d/')) {
      return url.replace(/\/edit.*$/, '/preview');
    }
    return url;
  };

  const handleOpenCreateModal = (type: 'google_sheet' | 'google_doc' = 'google_sheet') => {
    setActiveDoc(null);
    setItemType(type);
    setItemTitle(type === 'google_sheet' ? 'Nueva Hoja de Cálculo' : 'Nuevo Documento');
    setItemFolder(selectedFolder !== 'all' ? selectedFolder : type === 'google_sheet' ? 'Finanzas & Inversión' : 'Legal & Constitución');
    setItemUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc: MigaliaDocument) => {
    setActiveDoc(doc);
    setItemType(doc.type === 'google_doc' || doc.type === 'doc' ? 'google_doc' : 'google_sheet');
    setItemTitle(doc.title);
    setItemFolder(doc.folder);
    setItemUrl(doc.googleUrl || (doc.content?.startsWith('http') ? doc.content : ''));
    setIsModalOpen(true);
  };

  const handleTogglePin = (e: React.MouseEvent, doc: MigaliaDocument) => {
    e.stopPropagation();
    onSaveDocument({
      ...doc,
      isPinned: !doc.isPinned,
      updatedAt: new Date().toISOString().split('T')[0],
    });
  };

  const handleSave = () => {
    if (!itemTitle.trim()) return;

    const finalUrl = itemUrl.trim();
    const docToSave: MigaliaDocument = {
      id: activeDoc ? activeDoc.id : 'doc-' + Date.now(),
      title: itemTitle.trim(),
      type: itemType,
      folder: itemFolder,
      content: finalUrl || (activeDoc?.content || ''),
      googleUrl: finalUrl || undefined,
      authorName: activeDoc?.authorName || currentPartnerName || 'Mario',
      createdAt: activeDoc?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPinned: activeDoc?.isPinned || false,
    };

    onSaveDocument(docToSave);
    setIsModalOpen(false);
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
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeMainTab === 'all' ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-600'}`}>
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
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeMainTab === 'sheets' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-100 text-stone-600'}`}>
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
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeMainTab === 'docs' ? 'bg-blue-800 text-blue-100' : 'bg-stone-100 text-stone-600'}`}>
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
            onClick={() => handleOpenCreateModal('google_sheet')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Google Sheet</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal('google_doc')}
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
                Vincula tus Google Sheets o Google Docs oficiales o explora la carpeta de Google Drive.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleOpenCreateModal('google_sheet')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Google Sheet</span>
                </button>
                <button
                  onClick={() => handleOpenCreateModal('google_doc')}
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
                              {hasValidLink ? 'Enlace Directo Activo' : 'Documento Estructurado'}
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

                      {/* Título */}
                      <h3
                        onClick={() => handleOpenEditModal(doc)}
                        className="font-serif font-bold text-stone-900 text-base leading-snug hover:text-stone-700 cursor-pointer transition line-clamp-2"
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
                          onClick={() => handleOpenEditModal(doc)}
                          className="flex-1 py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium transition text-center"
                        >
                          Ver / Editar
                        </button>
                        {hasValidLink && (
                          <a
                            href={rawUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                              isSheet
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                            }`}
                          >
                            <span>Abrir</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

      {/* Modal Visor / Vinculador de Google Sheets o Google Docs */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div
            className={`bg-white w-full rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isFullscreen ? 'h-[98vh] max-w-[98vw]' : 'h-[90vh] max-w-5xl'
            }`}
          >
            {/* Header del Modal */}
            <div className="p-4 sm:px-6 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <span
                  className={`p-2 rounded-xl shadow-xs border ${
                    itemType === 'google_sheet'
                      ? 'bg-emerald-50 text-[#0F9D58] border-emerald-200'
                      : 'bg-blue-50 text-[#4285F4] border-blue-200'
                  }`}
                >
                  {itemType === 'google_sheet' ? (
                    <FileSpreadsheet className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </span>
                <input
                  type="text"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Título del documento u hoja..."
                  className="bg-transparent text-base sm:text-lg font-serif font-bold text-stone-900 border-b border-dashed border-stone-300 focus:border-stone-600 focus:outline-none w-full max-w-md py-0.5"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Tipo de Documento */}
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as 'google_sheet' | 'google_doc')}
                  className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none font-medium"
                >
                  <option value="google_sheet">📊 Google Sheets</option>
                  <option value="google_doc">📄 Google Docs</option>
                </select>

                <select
                  value={itemFolder}
                  onChange={(e) => setItemFolder(e.target.value as DocumentFolder)}
                  className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none font-medium"
                >
                  {FOLDERS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                {itemUrl && itemUrl.startsWith('http') && (
                  <a
                    href={itemUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-semibold transition shadow-xs ${
                      itemType === 'google_sheet'
                        ? 'bg-[#0F9D58] hover:bg-emerald-700'
                        : 'bg-[#4285F4] hover:bg-blue-600'
                    }`}
                    title="Abrir en pestaña completa de Google"
                  >
                    <span>Abrir en Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition hidden sm:block"
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Guardar</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Barra de Enlace de Google */}
            <div
              className={`p-3.5 border-b border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs ${
                itemType === 'google_sheet' ? 'bg-emerald-50/60' : 'bg-blue-50/60'
              }`}
            >
              <div className="flex-1 flex items-center gap-2">
                <span className="font-bold text-stone-800 shrink-0">
                  {itemType === 'google_sheet' ? 'Enlace de Google Sheets:' : 'Enlace de Google Docs:'}
                </span>
                <input
                  type="url"
                  placeholder={
                    itemType === 'google_sheet'
                      ? 'https://docs.google.com/spreadsheets/d/...'
                      : 'https://docs.google.com/document/d/...'
                  }
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {itemType === 'google_sheet' ? (
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Crear nueva hoja (sheets.new)
                  </a>
                ) : (
                  <a
                    href="https://docs.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Crear nuevo doc (docs.new)
                  </a>
                )}
              </div>
            </div>

            {/* Contenedor: Iframe o Instrucciones Claras */}
            <div className="flex-1 bg-stone-100 p-2 sm:p-4 overflow-hidden flex flex-col">
              {itemUrl && itemUrl.startsWith('http') ? (
                <div className="flex-1 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-inner flex flex-col relative">
                  <div className="p-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-stone-600" />
                      <span>
                        Vista previa embebida de Google Workspace:
                      </span>
                    </div>
                    <a
                      href={itemUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`px-2.5 py-1 text-white text-[11px] font-semibold rounded-lg transition inline-flex items-center gap-1 ${
                        itemType === 'google_sheet'
                          ? 'bg-[#0F9D58] hover:bg-emerald-700'
                          : 'bg-[#4285F4] hover:bg-blue-600'
                      }`}
                    >
                      <span>Abrir en Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <iframe
                    src={getEmbedUrl(itemUrl, itemType)}
                    className="w-full flex-1 border-0"
                    title="Recurso Embebido de Google Workspace"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              ) : (
                <div className="flex-1 bg-white rounded-2xl border border-dashed border-stone-300 p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto my-auto shadow-xs">
                  <div
                    className={`p-4 rounded-2xl mb-4 ${
                      itemType === 'google_sheet'
                        ? 'bg-emerald-50 text-[#0F9D58]'
                        : 'bg-blue-50 text-[#4285F4]'
                    }`}
                  >
                    {itemType === 'google_sheet' ? (
                      <FileSpreadsheet className="w-12 h-12" />
                    ) : (
                      <FileText className="w-12 h-12" />
                    )}
                  </div>
                  <h4 className="text-lg font-serif font-bold text-stone-900">
                    {itemType === 'google_sheet'
                      ? 'Pega el enlace de tu Google Sheet'
                      : 'Pega el enlace de tu Google Doc'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-md">
                    O guárdalo dentro de la carpeta oficial de Drive de Migalia.
                  </p>

                  <div className="w-full text-left text-xs text-stone-700 mt-4 space-y-2.5 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Abre tu archivo o entra a la{' '}
                        <a
                          href={MIGALIA_DRIVE_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold underline text-amber-800"
                        >
                          Carpeta Oficial de Drive de Migalia
                        </a>
                        .
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span>Haz clic en el botón <strong>«Compartir»</strong> arriba a la derecha.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span>Copia el enlace y pégalo arriba en el campo de enlace.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

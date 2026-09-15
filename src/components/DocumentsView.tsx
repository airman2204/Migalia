'use client';

import React, { useState, useMemo } from 'react';
import { MigaliaDocument, DocumentFolder, DocumentType } from '@/types';
import {
  FileText,
  Plus,
  Search,
  Folder,
  Trash2,
  Edit3,
  ExternalLink,
  Save,
  X,
  FileSpreadsheet,
  Calendar,
  User,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  HelpCircle,
  Pin,
  AlertCircle,
  BookOpen,
  Link2,
} from 'lucide-react';

interface DocumentsViewProps {
  documents: MigaliaDocument[];
  currentPartnerName: string;
  onSaveDocument: (doc: MigaliaDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

const FOLDERS: DocumentFolder[] = [
  'Legal & Constitución',
  'Finanzas & Inversión',
  'Operaciones & Taller',
  'Branding & Mercadotecnia',
  'General',
];

/**
 * Vista del Gestor de Documentos & Integrador de Google Workspace.
 * Permite filtrar por carpetas de negocio, buscar en tiempo real y embeber
 * hojas de cálculo (Google Sheets) y documentos de texto oficiales (Google Docs).
 */
export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  currentPartnerName,
  onSaveDocument,
  onDeleteDocument,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<'all' | DocumentFolder>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDoc, setActiveDoc] = useState<MigaliaDocument | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newDocTypeModal, setNewDocTypeModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Estados del editor / vinculación
  const [editTitle, setEditTitle] = useState('');
  const [editFolder, setEditFolder] = useState<DocumentFolder>('General');
  const [editType, setEditType] = useState<DocumentType>('doc');
  const [editUrl, setEditUrl] = useState('');
  const [editContent, setEditContent] = useState('');

  // Filtrado reactivo optimizado con useMemo (mostrando fijados primero)
  const filteredDocs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = documents.filter((d) => {
      const matchFolder = selectedFolder === 'all' || d.folder === selectedFolder;
      if (!matchFolder) return false;
      if (!term) return true;
      return (
        d.title.toLowerCase().includes(term) ||
        d.folder.toLowerCase().includes(term) ||
        (d.authorName || '').toLowerCase().includes(term)
      );
    });

    // Ordenar: Fijados (pinned) primero, luego por fecha descendente
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });
  }, [documents, selectedFolder, searchTerm]);

  const isGoogleResource = (type: DocumentType, url?: string, content?: string) => {
    if (type === 'google_sheet' || type === 'google_doc' || type === 'google_embed') return true;
    const target = url || content || '';
    return target.startsWith('http://') || target.startsWith('https://');
  };

  const handleOpenCreateModal = (type: DocumentType) => {
    setNewDocTypeModal(false);
    setEditType(type);
    setEditTitle(
      type === 'google_sheet'
        ? 'Nueva Hoja de Cálculo (Google Sheets)'
        : type === 'google_doc'
        ? 'Nuevo Documento Oficial (Google Docs)'
        : type === 'sheet'
        ? 'Nueva Tabla / Presupuesto Interno'
        : 'Nuevo Documento / Nota Estratégica'
    );
    setEditFolder(selectedFolder !== 'all' ? selectedFolder : 'General');
    setEditUrl('');
    setEditContent('');
    setActiveDoc(null);
    setIsEditorOpen(true);
  };

  const handleOpenDoc = (doc: MigaliaDocument) => {
    setActiveDoc(doc);
    setEditType(doc.type);
    setEditTitle(doc.title);
    setEditFolder(doc.folder);
    
    // Si tiene googleUrl o si content es URL web, cargar en editUrl
    if (doc.googleUrl || (doc.content && (doc.content.startsWith('http://') || doc.content.startsWith('https://')))) {
      setEditUrl(doc.googleUrl || doc.content);
      setEditContent('');
    } else {
      setEditUrl('');
      setEditContent(doc.content || '');
    }
    
    setIsEditorOpen(true);
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
    if (!editTitle.trim()) return;

    const finalUrl = editUrl.trim();
    const isUrl = finalUrl.startsWith('http://') || finalUrl.startsWith('https://');
    
    const docToSave: MigaliaDocument = {
      id: activeDoc ? activeDoc.id : 'doc-' + Date.now(),
      title: editTitle.trim(),
      type: editType,
      folder: editFolder,
      content: isUrl ? finalUrl : (editContent || finalUrl),
      googleUrl: isUrl ? finalUrl : undefined,
      authorName: activeDoc?.authorName || currentPartnerName || 'Mario',
      createdAt: activeDoc?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPinned: activeDoc?.isPinned || false,
    };

    onSaveDocument(docToSave);
    setIsEditorOpen(false);
  };

  // Convertir URL compartida de Google Drive/Docs/Sheets para iframe embebido óptimo
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    let url = rawUrl.trim();
    
    // Si ya contiene /preview o /pubhtml, lo dejamos
    if (url.includes('/preview') || url.includes('/pubhtml')) {
      return url;
    }
    
    // Para Google Docs y Google Sheets en modo embebible interactivo
    if (url.includes('docs.google.com/document/d/') || url.includes('docs.google.com/spreadsheets/d/')) {
      // Reemplaza /edit o lo que esté al final con /preview para evitar bloqueos por X-Frame-Options
      return url.replace(/\/edit.*$/, '/preview');
    }

    return url;
  };

  const getFolderBadge = (folder: DocumentFolder) => {
    switch (folder) {
      case 'Legal & Constitución':
        return (
          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
            <ShieldCheck className="w-3 h-3" /> Legal
          </span>
        );
      case 'Finanzas & Inversión':
        return (
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
            <TrendingUp className="w-3 h-3" /> Finanzas & Fórmulas
          </span>
        );
      case 'Operaciones & Taller':
        return (
          <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg text-[11px] font-medium">
            <Layers className="w-3 h-3" /> Operaciones
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
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#0F9D58]/10 text-[#0F9D58] rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                Google Workspace & Archivos
              </h1>
              <span className="text-[11px] font-bold text-[#0F9D58] uppercase tracking-wider">
                Google Sheets & Google Docs Oficial
              </span>
            </div>
          </div>
          <p className="text-sm text-stone-500 mt-1.5">
            Hojas de cálculo financieras con soporte completo para fórmulas avanzadas de Excel/Google, actas legales y sincronización multiusuario en la nube.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNewDocTypeModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#0F9D58]" />
            <span>+ Nuevo Google Sheet / Doc</span>
          </button>
        </div>
      </div>

      {/* Carpetas y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Selector de Carpetas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedFolder === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Todos ({documents.length})
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
            placeholder="Buscar hoja, acta o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Tarjetas de Documentos */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No hay archivos en esta carpeta</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Crea tu primer documento, nota estratégica o vincula una hoja de Google Sheets.
          </p>
          <button
            onClick={() => setNewDocTypeModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Crear nuevo archivo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isSheet = doc.type === 'google_sheet' || doc.type === 'sheet';
            const isDoc = doc.type === 'google_doc' || doc.type === 'doc';
            const isGoogle = isGoogleResource(doc.type, doc.googleUrl, doc.content);
            const fileUrl = doc.googleUrl || (doc.content?.startsWith('http') ? doc.content : '');

            return (
              <div
                key={doc.id}
                className={`group bg-white rounded-2xl border transition-all flex flex-col justify-between ${
                  doc.isPinned
                    ? 'border-amber-400/80 shadow-sm bg-gradient-to-b from-amber-50/20 to-white'
                    : 'border-stone-200 hover:shadow-md hover:border-stone-300'
                } p-5`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2.5 rounded-xl border border-stone-100 group-hover:scale-105 transition bg-stone-50">
                        {isSheet ? (
                          <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#4285F4]" />
                        )}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block text-stone-500">
                          {isGoogle
                            ? isSheet
                              ? 'Google Sheets Oficial'
                              : 'Google Docs Oficial'
                            : isSheet
                            ? 'Tabla / Presupuesto'
                            : 'Documento / Minuta'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {isGoogle ? '🔗 Google Workspace' : '📝 Documento Interno'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleTogglePin(e, doc)}
                        className={`p-1.5 rounded-lg transition ${
                          doc.isPinned
                            ? 'text-amber-600 bg-amber-100/60 hover:bg-amber-100'
                            : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                        }`}
                        title={doc.isPinned ? 'Desfijar de la parte superior' : 'Fijar en la parte superior'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {fileUrl && fileUrl.startsWith('http') && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Abrir en Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenDoc(doc)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                        title="Ver / Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el archivo "${doc.title}"?`)) {
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

                  <h3
                    onClick={() => handleOpenDoc(doc)}
                    className="font-serif font-bold text-stone-900 text-base leading-snug hover:text-amber-800 cursor-pointer transition line-clamp-2"
                  >
                    {doc.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2">
                    {getFolderBadge(doc.folder)}
                    {doc.isPinned && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        📌 Fijado
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    <span className="font-medium text-stone-600">{doc.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{doc.updatedAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear nuevo Documento / Archivo */}
      {newDocTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">Nuevo Documento o Archivo</h3>
              </div>
              <button
                onClick={() => setNewDocTypeModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mt-3 mb-4">
              Elige el formato de documento que deseas redactar o integrar al expediente:
            </p>

            <div className="space-y-3">
              {/* Opción 1: Documento de Texto / Minuta Interna */}
              <button
                onClick={() => handleOpenCreateModal('doc')}
                className="w-full flex items-start gap-3 p-4 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/20 text-left transition group"
              >
                <div className="p-3 bg-amber-500/10 text-amber-700 rounded-xl group-hover:scale-105 transition">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-800">
                    Documento de Texto / Nota Interna
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    Editor directo integrado para minutas de asamblea, acuerdos de cofundadores, políticas internas y manuales operativos sin salir de la app.
                  </p>
                </div>
              </button>

              {/* Opción 2: Google Sheet */}
              <button
                onClick={() => handleOpenCreateModal('google_sheet')}
                className="w-full flex items-start gap-3 p-4 rounded-2xl border border-stone-200 hover:border-[#0F9D58] hover:bg-emerald-50/20 text-left transition group"
              >
                <div className="p-3 bg-[#0F9D58]/10 text-[#0F9D58] rounded-xl group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#0F9D58]">
                    Vincular Google Sheets Oficial
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    Soporte 100% nativo de fórmulas matemáticas (`SUMA`, `BUSCARV`), tablas dinámicas y modelos financieros en la nube.
                  </p>
                </div>
              </button>

              {/* Opción 3: Google Doc */}
              <button
                onClick={() => handleOpenCreateModal('google_doc')}
                className="w-full flex items-start gap-3 p-4 rounded-2xl border border-stone-200 hover:border-[#4285F4] hover:bg-blue-50/20 text-left transition group"
              >
                <div className="p-3 bg-[#4285F4]/10 text-[#4285F4] rounded-xl group-hover:scale-105 transition">
                  <Link2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#4285F4]">
                    Vincular Google Docs Oficial
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    Enlaza contratos notariales, estatutos de visa E-2 y expedientes en vivo alojados en tu Google Drive.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visor / Editor Completo */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div
            className={`bg-white w-full rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isFullscreen ? 'h-[98vh] max-w-[98vw]' : 'h-[92vh] max-w-6xl'
            }`}
          >
            {/* Header del Entorno */}
            <div className="p-4 sm:px-6 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <span className="p-2 bg-white border border-stone-200 rounded-xl shadow-xs">
                  {editType === 'google_sheet' || editType === 'sheet' ? (
                    <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
                  ) : (
                    <FileText className="w-5 h-5 text-[#4285F4]" />
                  )}
                </span>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Nombre del documento o presupuesto..."
                  className="bg-transparent text-lg font-serif font-bold text-stone-900 border-b border-dashed border-stone-300 focus:border-amber-500 focus:outline-none w-full max-w-md py-0.5"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Selector de Tipo (Google Link vs Documento de Texto) */}
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as DocumentType)}
                  className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none"
                >
                  <option value="doc">📝 Documento de Texto / Nota</option>
                  <option value="google_sheet">📊 Google Sheets (Enlace Web)</option>
                  <option value="google_doc">📑 Google Docs (Enlace Web)</option>
                </select>

                <select
                  value={editFolder}
                  onChange={(e) => setEditFolder(e.target.value as DocumentFolder)}
                  className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {FOLDERS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                {editUrl && editUrl.startsWith('http') && (
                  <a
                    href={editUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium transition shadow-xs"
                    title="Abrir en pestaña completa"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Abrir enlace</span>
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
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Guardar</span>
                </button>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subheader condicional: si es Google Workspace */}
            {(editType === 'google_sheet' || editType === 'google_doc' || editUrl.startsWith('http')) && (
              <div className="p-3.5 bg-emerald-50/60 border-b border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-bold text-stone-700 shrink-0">Enlace de Google:</span>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/... o docs.google.com/document/d/..."
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {editType === 'google_sheet' ? (
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Crear nueva en Google (sheets.new)
                    </a>
                  ) : (
                    <a
                      href="https://docs.new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Crear nuevo en Google (docs.new)
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Contenido: Editor de Texto o Visor Embebido */}
            <div className="flex-1 bg-stone-100 p-2 sm:p-4 overflow-hidden flex flex-col">
              {editType === 'doc' && !editUrl.startsWith('http') ? (
                <div className="flex-1 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-3 text-xs text-stone-400 pb-2 border-b border-stone-150">
                    <span>Editor de Texto / Formato Documento</span>
                    <span>Puedes redactar o pegar acuerdos, contratos o notas formateadas</span>
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Escribe aquí el contenido del documento, minuta, checklist o cláusulas del proyecto..."
                    className="flex-1 w-full p-4 font-mono text-xs sm:text-sm text-stone-800 bg-stone-50/40 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none leading-relaxed overflow-y-auto"
                  />
                </div>
              ) : editUrl && editUrl.startsWith('http') ? (
                <div className="flex-1 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-inner flex flex-col relative">
                  {/* Banner de soporte iframe */}
                  <div className="p-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        Si la ventana muestra fondo gris o bloqueo de seguridad, ábrelo con el botón directo:
                      </span>
                    </div>
                    <a
                      href={editUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-stone-900 text-white hover:bg-stone-800 text-[11px] font-semibold rounded-lg transition inline-flex items-center gap-1"
                    >
                      <span>Abrir en Google Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <iframe
                    src={getEmbedUrl(editUrl)}
                    className="w-full flex-1 border-0"
                    title="Entorno Oficial Google Workspace"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              ) : (
                <div className="flex-1 bg-white rounded-2xl border border-dashed border-stone-300 p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4">
                    <FileSpreadsheet className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900">
                    Conecta tu Google Sheet o Google Doc Oficial
                  </h4>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    Para disfrutar de todas las fórmulas de Excel, tablas dinámicas y cálculos automáticos:
                  </p>
                  <ol className="text-left text-xs text-stone-600 mt-3 space-y-1.5 list-decimal list-inside bg-stone-50 p-4 rounded-xl border border-stone-200 w-full">
                    <li>Abre tu hoja en Google Drive (o haz clic en <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">sheets.new</a>).</li>
                    <li>Haz clic en el botón <strong>Compartir</strong> en la esquina superior derecha.</li>
                    <li>Cambia el acceso a <strong>«Cualquier persona con el enlace (Lector o Editor)»</strong>.</li>
                    <li>Copia el enlace y pégalo en la barra superior.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

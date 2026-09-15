'use client';

import React, { useState, useMemo } from 'react';
import { MigaliaDocument, DocumentFolder } from '@/types';
import {
  FileSpreadsheet,
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

/**
 * Vista de Hojas de Cálculo & Modelos en Google Sheets.
 * Diseñada para ser directa y sin complicaciones:
 * 1. Agregar el título del modelo / hoja.
 * 2. Pegar el enlace de Google Sheets (o abrir sheets.new en 1 clic).
 * 3. Consultar la hoja embebida o abrirla en Google Drive.
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Campos de formulario para agregar / editar hoja
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetFolder, setSheetFolder] = useState<DocumentFolder>('Finanzas & Inversión');
  const [sheetUrl, setSheetUrl] = useState('');

  // Filtrado y ordenamiento de hojas (fijadas arriba)
  const filteredSheets = useMemo(() => {
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

    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });
  }, [documents, selectedFolder, searchTerm]);

  // Conversión inteligente del link para renderizado óptimo en iframe
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    let url = rawUrl.trim();
    if (url.includes('/preview') || url.includes('/pubhtml')) {
      return url;
    }
    if (url.includes('docs.google.com/spreadsheets/d/')) {
      return url.replace(/\/edit.*$/, '/preview');
    }
    return url;
  };

  const handleOpenCreateModal = () => {
    setActiveDoc(null);
    setSheetTitle('');
    setSheetFolder(selectedFolder !== 'all' ? selectedFolder : 'Finanzas & Inversión');
    setSheetUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc: MigaliaDocument) => {
    setActiveDoc(doc);
    setSheetTitle(doc.title);
    setSheetFolder(doc.folder);
    setSheetUrl(doc.googleUrl || (doc.content?.startsWith('http') ? doc.content : ''));
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
    if (!sheetTitle.trim()) return;

    const finalUrl = sheetUrl.trim();
    const docToSave: MigaliaDocument = {
      id: activeDoc ? activeDoc.id : 'doc-' + Date.now(),
      title: sheetTitle.trim(),
      type: 'google_sheet',
      folder: sheetFolder,
      content: finalUrl,
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
      {/* Header Principal Google Sheets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-emerald-50 text-[#0F9D58] rounded-xl border border-emerald-100 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                Google Sheets
              </h1>
              <span className="text-[11px] font-bold text-[#0F9D58] uppercase tracking-wider">
                Hojas de Cálculo & Modelos Financieros en la Nube
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-2xl">
            Tus presupuestos, costeo de insumos, nóminas y proyecciones de inversión sincronizados en Google Drive con soporte total para fórmulas matemáticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition"
            title="Crear nueva hoja en blanco en tu cuenta de Google"
          >
            <Plus className="w-3.5 h-3.5 text-[#0F9D58]" />
            <span>Crear en sheets.new</span>
            <ExternalLink className="w-3 h-3 text-[#0F9D58]" />
          </a>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Vincular Hoja</span>
          </button>
        </div>
      </div>

      {/* Selector de Carpetas y Buscador */}
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
            placeholder="Buscar hoja de cálculo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Lista de Hojas de Cálculo en Cards */}
      {filteredSheets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="w-14 h-14 bg-emerald-50 text-[#0F9D58] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-stone-800">No hay hojas de cálculo vinculadas</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Vincula tus Google Sheets de costeo, proyecciones financieras o inventarios para tenerlos a un clic.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vincular Google Sheet</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSheets.map((sheet) => {
            const rawUrl = sheet.googleUrl || (sheet.content?.startsWith('http') ? sheet.content : '');
            const hasValidLink = Boolean(rawUrl && rawUrl.startsWith('http'));

            return (
              <div
                key={sheet.id}
                className={`group bg-white rounded-2xl border transition-all flex flex-col justify-between ${
                  sheet.isPinned
                    ? 'border-emerald-400/80 shadow-xs bg-gradient-to-b from-emerald-50/20 to-white'
                    : 'border-stone-200 hover:shadow-md hover:border-stone-300'
                } p-5`}
              >
                <div>
                  {/* Encabezado de la Card */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition text-[#0F9D58]">
                        <FileSpreadsheet className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F9D58] block">
                          Google Sheets
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {hasValidLink ? 'Enlace Directo Activo' : 'Sin enlace configurado'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleTogglePin(e, sheet)}
                        className={`p-1.5 rounded-lg transition ${
                          sheet.isPinned
                            ? 'text-amber-600 bg-amber-100/70 hover:bg-amber-100'
                            : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                        }`}
                        title={sheet.isPinned ? 'Desfijar' : 'Fijar arriba'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {hasValidLink && (
                        <a
                          href={rawUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                          title="Abrir en Google Sheets en pestaña nueva"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${sheet.title}" del listado?`)) {
                            onDeleteDocument(sheet.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Título de la Hoja */}
                  <h3
                    onClick={() => handleOpenEditModal(sheet)}
                    className="font-serif font-bold text-stone-900 text-base leading-snug hover:text-emerald-700 cursor-pointer transition line-clamp-2"
                  >
                    {sheet.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2">
                    {getFolderBadge(sheet.folder)}
                    {sheet.isPinned && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        📌 Fijado
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones Rápidas en Footer */}
                <div className="mt-5 pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span className="font-medium text-stone-600">{sheet.authorName || 'Mario'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{sheet.updatedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEditModal(sheet)}
                      className="flex-1 py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium transition text-center"
                    >
                      Ver / Configurar
                    </button>
                    {hasValidLink && (
                      <a
                        href={rawUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition flex items-center gap-1"
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

      {/* Modal Visor / Vinculador de Google Sheets */}
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
                <span className="p-2 bg-emerald-50 text-[#0F9D58] border border-emerald-200 rounded-xl shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  placeholder="Título de la Hoja (ej. Costeo de Galletas, Presupuesto CAPEX)..."
                  className="bg-transparent text-base sm:text-lg font-serif font-bold text-stone-900 border-b border-dashed border-stone-300 focus:border-emerald-600 focus:outline-none w-full max-w-md py-0.5"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={sheetFolder}
                  onChange={(e) => setSheetFolder(e.target.value as DocumentFolder)}
                  className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                >
                  {FOLDERS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                {sheetUrl && sheetUrl.startsWith('http') && (
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                    title="Abrir en pestaña completa de Google Sheets"
                  >
                    <span>Abrir en Google Sheets</span>
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

            {/* Barra de Enlace de Google Sheets */}
            <div className="p-3.5 bg-emerald-50/60 border-b border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="flex-1 flex items-center gap-2">
                <span className="font-bold text-emerald-900 shrink-0">Enlace de Google Sheets:</span>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/123456.../edit"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-mono"
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Crear nueva (sheets.new)
                </a>
              </div>
            </div>

            {/* Contenedor: Iframe o Instrucciones Claras */}
            <div className="flex-1 bg-stone-100 p-2 sm:p-4 overflow-hidden flex flex-col">
              {sheetUrl && sheetUrl.startsWith('http') ? (
                <div className="flex-1 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-inner flex flex-col relative">
                  <div className="p-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Vista previa embebida. Para editar con todas las barras de herramientas de Google:
                      </span>
                    </div>
                    <a
                      href={sheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-[#0F9D58] text-white hover:bg-emerald-700 text-[11px] font-semibold rounded-lg transition inline-flex items-center gap-1"
                    >
                      <span>Abrir en Google Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <iframe
                    src={getEmbedUrl(sheetUrl)}
                    className="w-full flex-1 border-0"
                    title="Google Sheets Embebido"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              ) : (
                <div className="flex-1 bg-white rounded-2xl border border-dashed border-stone-300 p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto my-auto shadow-xs">
                  <div className="p-4 bg-emerald-50 text-[#0F9D58] rounded-2xl mb-4">
                    <FileSpreadsheet className="w-12 h-12" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-stone-900">
                    Pega el enlace de tu Google Sheet
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-md">
                    Es muy fácil y no necesitas redactar nada manual:
                  </p>

                  <div className="w-full text-left text-xs text-stone-700 mt-4 space-y-2.5 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <span>Abre tu hoja en Google Sheets o crea una nueva con <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">sheets.new</a>.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span>Haz clic en el botón <strong>«Compartir»</strong> arriba a la derecha.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span>Elige <strong>«Cualquier persona con el enlace»</strong> y copia el enlace.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                      <span>Pégalo arriba en el campo de enlace y presiona <strong>«Guardar»</strong>.</span>
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

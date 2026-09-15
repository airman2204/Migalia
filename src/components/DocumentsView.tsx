'use client';

import React, { useState } from 'react';
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
  Bold,
  Italic,
  Underline,
  List,
  Heading1,
  Heading2,
  Printer,
  PlusCircle,
  FileSpreadsheet,
  Calendar,
  User,
  ShieldCheck,
  TrendingUp,
  Layers,
  Sparkles,
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

  // Estados del editor
  const [editTitle, setEditTitle] = useState('');
  const [editFolder, setEditFolder] = useState<DocumentFolder>('General');
  const [editType, setEditType] = useState<DocumentType>('doc');
  const [editDocContent, setEditDocContent] = useState('');
  const [editEmbedUrl, setEditEmbedUrl] = useState('');

  // Para Sheets nativo
  const [sheetData, setSheetData] = useState<{ columns: string[]; rows: string[][] }>({
    columns: ['Concepto / Descripción', 'Categoría', 'Presupuesto', 'Real'],
    rows: [
      ['Ej. Horno Convección', 'Equipamiento', '42000', '0'],
      ['Ej. Protocolización Acta', 'Legal', '16500', '0'],
    ],
  });

  const filteredDocs = documents.filter((d) => {
    const matchFolder = selectedFolder === 'all' || d.folder === selectedFolder;
    const matchSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFolder && matchSearch;
  });

  const handleOpenNew = (type: DocumentType) => {
    setNewDocTypeModal(false);
    setEditType(type);
    setEditTitle(
      type === 'doc'
        ? 'Nuevo Documento de Texto'
        : type === 'sheet'
        ? 'Nueva Hoja de Cálculo'
        : 'Documento de Google Workspace'
    );
    setEditFolder(selectedFolder !== 'all' ? selectedFolder : 'General');

    if (type === 'doc') {
      setEditDocContent('<h2>Título del Documento</h2><p>Escribe aquí las notas, minutas o estatutos...</p>');
    } else if (type === 'sheet') {
      setSheetData({
        columns: ['Concepto / Descripción', 'Categoría', 'Presupuesto', 'Real'],
        rows: [
          ['Ej. Inversión Inicial', 'Equipamiento', '15000', '0'],
          ['Ej. Permisos y Trámites', 'Legal', '8500', '0'],
        ],
      });
    } else {
      setEditEmbedUrl('');
    }

    setActiveDoc(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (doc: MigaliaDocument) => {
    setActiveDoc(doc);
    setEditType(doc.type);
    setEditTitle(doc.title);
    setEditFolder(doc.folder);

    if (doc.type === 'doc') {
      setEditDocContent(doc.content);
    } else if (doc.type === 'sheet') {
      try {
        const parsed = JSON.parse(doc.content);
        if (parsed.columns && parsed.rows) {
          setSheetData(parsed);
        }
      } catch (e) {
        setSheetData({
          columns: ['Columna A', 'Columna B'],
          rows: [['', '']],
        });
      }
    } else if (doc.type === 'google_embed') {
      setEditEmbedUrl(doc.content);
    }

    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;

    let finalContent = '';
    if (editType === 'doc') {
      finalContent = editDocContent;
    } else if (editType === 'sheet') {
      finalContent = JSON.stringify(sheetData);
    } else if (editType === 'google_embed') {
      finalContent = editEmbedUrl.trim();
    }

    const docToSave: MigaliaDocument = {
      id: activeDoc ? activeDoc.id : 'doc-' + Date.now(),
      title: editTitle.trim(),
      type: editType,
      folder: editFolder,
      content: finalContent,
      authorName: activeDoc?.authorName || currentPartnerName || 'Mario',
      createdAt: activeDoc?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPinned: activeDoc?.isPinned || false,
    };

    onSaveDocument(docToSave);
    setIsEditorOpen(false);
  };

  // Operaciones de Hoja de Cálculo (Sheets)
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const newRows = sheetData.rows.map((row, r) =>
      r === rIdx ? row.map((cell, c) => (c === cIdx ? val : cell)) : row
    );
    setSheetData({ ...sheetData, rows: newRows });
  };

  const handleColumnHeaderChange = (cIdx: number, val: string) => {
    const newCols = sheetData.columns.map((col, c) => (c === cIdx ? val : col));
    setSheetData({ ...sheetData, columns: newCols });
  };

  const addSheetRow = () => {
    const emptyRow = new Array(sheetData.columns.length).fill('');
    setSheetData({ ...sheetData, rows: [...sheetData.rows, emptyRow] });
  };

  const deleteSheetRow = (rIdx: number) => {
    if (sheetData.rows.length <= 1) return;
    setSheetData({ ...sheetData, rows: sheetData.rows.filter((_, idx) => idx !== rIdx) });
  };

  const addSheetCol = () => {
    const newColName = 'Columna ' + String.fromCharCode(65 + sheetData.columns.length);
    setSheetData({
      columns: [...sheetData.columns, newColName],
      rows: sheetData.rows.map((row) => [...row, '']),
    });
  };

  const deleteSheetCol = (cIdx: number) => {
    if (sheetData.columns.length <= 1) return;
    setSheetData({
      columns: sheetData.columns.filter((_, idx) => idx !== cIdx),
      rows: sheetData.rows.map((row) => row.filter((_, idx) => idx !== cIdx)),
    });
  };

  const executeDocCommand = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
  };

  const getFolderBadge = (folder: DocumentFolder) => {
    switch (folder) {
      case 'Legal & Constitución':
        return <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium"><ShieldCheck className="w-3 h-3" /> Legal</span>;
      case 'Finanzas & Inversión':
        return <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium"><TrendingUp className="w-3 h-3" /> Finanzas</span>;
      case 'Operaciones & Taller':
        return <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-[11px] font-medium"><Layers className="w-3 h-3" /> Operaciones</span>;
      case 'Branding & Mercadotecnia':
        return <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] font-medium"><Sparkles className="w-3 h-3" /> Branding</span>;
      default:
        return <span className="flex items-center gap-1 text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-[11px] font-medium"><Folder className="w-3 h-3" /> General</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-stone-900 text-amber-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Documentos & Archivos
            </h1>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Gestión centralizada de actas, estatutos, presupuestos e integraciones de Google Workspace.
          </p>
        </div>

        <button
          onClick={() => setNewDocTypeModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Documento</span>
        </button>
      </div>

      {/* Carpetas y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Pestañas de Carpetas */}
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
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-stone-800 text-amber-400' : 'bg-stone-100 text-stone-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en títulos y contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Grid de Documentos */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No hay documentos en esta vista</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No se encontraron resultados con ese criterio de búsqueda.'
              : 'Esta carpeta aún no tiene archivos creados. Crea el primero ahora.'}
          </p>
          <button
            onClick={() => setNewDocTypeModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Documento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-stone-50 border border-stone-100 rounded-xl group-hover:scale-105 transition">
                      {doc.type === 'doc' && <FileText className="w-4 h-4 text-blue-600" />}
                      {doc.type === 'sheet' && <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                      {doc.type === 'google_embed' && <ExternalLink className="w-4 h-4 text-amber-600" />}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      {doc.type === 'doc' ? 'Migalia Doc' : doc.type === 'sheet' ? 'Migalia Sheet' : 'Google Workspace'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el documento "${doc.title}"?`)) {
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
                  onClick={() => handleEdit(doc)}
                  className="font-serif font-bold text-stone-900 text-base leading-snug hover:text-amber-700 cursor-pointer transition line-clamp-2"
                >
                  {doc.title}
                </h3>

                <div className="mt-3">
                  {getFolderBadge(doc.folder)}
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
          ))}
        </div>
      )}

      {/* Modal 1: Selector de tipo de nuevo documento */}
      {newDocTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">Nuevo Documento</h3>
              </div>
              <button
                onClick={() => setNewDocTypeModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mt-3 mb-4">
              Selecciona el tipo de archivo que deseas incorporar a la plataforma:
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleOpenNew('doc')}
                className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-blue-500 hover:bg-blue-50/20 text-left transition"
              >
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Migalia Docs (Texto Enriquecido)</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Actas, minutas de asamblea, estatutos, contratos y manuales.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleOpenNew('sheet')}
                className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition"
              >
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Migalia Sheets (Hoja de Cálculo)</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Presupuesto CAPEX, proyección de costos fijos e inventario.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleOpenNew('google_embed')}
                className="w-full flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/20 text-left transition"
              >
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Vincular Google Doc / Sheet</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Incrusta un documento de Google Drive en tiempo real dentro de Migalia.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Editor a Pantalla Completa */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full h-[94vh] max-w-6xl rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
            {/* Header del Editor */}
            <div className="p-4 sm:px-6 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <span className="p-2 bg-white border border-stone-200 rounded-xl">
                  {editType === 'doc' && <FileText className="w-4 h-4 text-blue-600" />}
                  {editType === 'sheet' && <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                  {editType === 'google_embed' && <ExternalLink className="w-4 h-4 text-amber-600" />}
                </span>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título del documento..."
                  className="bg-transparent text-lg font-serif font-bold text-stone-900 border-b border-dashed border-stone-300 focus:border-amber-500 focus:outline-none w-full max-w-md py-0.5"
                />
              </div>

              {/* Selector de Carpeta & Acciones */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={editFolder}
                  onChange={(e) => setEditFolder(e.target.value as DocumentFolder)}
                  className="text-xs bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {FOLDERS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                {editType === 'doc' && (
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium transition"
                    title="Exportar o imprimir a PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exportar PDF</span>
                  </button>
                )}

                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-medium transition shadow-sm"
                >
                  <Save className="w-4 h-4" />
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

            {/* Contenido del Editor */}
            <div className="flex-1 overflow-y-auto bg-stone-100/60 p-4 sm:p-6">
              {/* TIPO: DOC */}
              {editType === 'doc' && (
                <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col min-h-[75vh]">
                  {/* Toolbar */}
                  <div className="bg-stone-50 border-b border-stone-200 p-2 flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => executeDocCommand('bold')}
                      className="p-2 hover:bg-stone-200 rounded text-stone-700"
                      title="Negrita"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeDocCommand('italic')}
                      className="p-2 hover:bg-stone-200 rounded text-stone-700"
                      title="Cursiva"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeDocCommand('underline')}
                      className="p-2 hover:bg-stone-200 rounded text-stone-700"
                      title="Subrayado"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-5 bg-stone-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => executeDocCommand('formatBlock', '<h1>')}
                      className="p-2 hover:bg-stone-200 rounded text-stone-700"
                      title="Título Grande"
                    >
                      <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeDocCommand('formatBlock', '<h2>')}
                      className="p-2 hover:bg-stone-200 rounded text-stone-700"
                      title="Subtítulo"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => executeDocCommand('insertUnorderedList')}
                      className="p-2 hover:bg-stone-200 rounded text-stone-700"
                      title="Viñetas"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hoja editable */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setEditDocContent(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: editDocContent }}
                    className="flex-1 p-8 sm:p-12 outline-none text-stone-800 leading-relaxed font-sans text-sm focus:ring-0 min-h-[600px] prose max-w-none"
                  />
                </div>
              )}

              {/* TIPO: SHEET */}
              {editType === 'sheet' && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                    <div className="text-xs text-stone-500 font-medium">
                      Filas: <span className="font-bold text-stone-800">{sheetData.rows.length}</span> | Columnas: <span className="font-bold text-stone-800">{sheetData.columns.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={addSheetRow}
                        className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fila</span>
                      </button>
                      <button
                        onClick={addSheetCol}
                        className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Columna</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto border border-stone-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-stone-100 border-b border-stone-200">
                          <th className="p-2 w-10 text-center text-[10px] font-bold text-stone-400 uppercase border-r border-stone-200">
                            #
                          </th>
                          {sheetData.columns.map((col, cIdx) => (
                            <th key={cIdx} className="p-2 border-r border-stone-200 min-w-[140px]">
                              <div className="flex items-center justify-between gap-1">
                                <input
                                  type="text"
                                  value={col}
                                  onChange={(e) => handleColumnHeaderChange(cIdx, e.target.value)}
                                  className="w-full bg-transparent font-bold text-stone-700 text-xs focus:outline-none focus:bg-white rounded px-1"
                                />
                                {sheetData.columns.length > 1 && (
                                  <button
                                    onClick={() => deleteSheetCol(cIdx)}
                                    className="text-stone-400 hover:text-rose-500 text-xs px-1"
                                    title="Eliminar columna"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheetData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-stone-100 hover:bg-amber-50/20">
                            <td className="p-2 text-center text-stone-400 font-mono text-[10px] bg-stone-50 border-r border-stone-200 flex items-center justify-between px-1">
                              <span>{rIdx + 1}</span>
                              <button
                                onClick={() => deleteSheetRow(rIdx)}
                                className="text-stone-300 hover:text-rose-500 opacity-0 hover:opacity-100 transition"
                                title="Eliminar fila"
                              >
                                ×
                              </button>
                            </td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-1 border-r border-stone-100">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent text-stone-800 text-xs rounded focus:outline-none focus:bg-amber-50/50 focus:ring-1 focus:ring-amber-500"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TIPO: GOOGLE EMBED */}
              {editType === 'google_embed' && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Enlace de Google Docs o Google Sheets compartido:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://docs.google.com/document/d/... o https://docs.google.com/spreadsheets/d/..."
                        value={editEmbedUrl}
                        onChange={(e) => setEditEmbedUrl(e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                      <a
                        href={editEmbedUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir en Drive</span>
                      </a>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1.5">
                      💡 Asegúrate de que el documento en Google Drive tenga permisos de acceso para «Cualquier persona con el enlace».
                    </p>
                  </div>

                  <div className="flex-1 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50 flex items-center justify-center">
                    {editEmbedUrl ? (
                      <iframe
                        src={
                          editEmbedUrl.includes('preview') || editEmbedUrl.includes('pubhtml')
                            ? editEmbedUrl
                            : editEmbedUrl.replace(/\/edit.*$/, '/preview')
                        }
                        className="w-full h-full border-0"
                        title="Google Workspace Embed"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <ExternalLink className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                        <p className="text-xs text-stone-500 font-medium">
                          Pega un enlace de Google Doc o Sheet para previsualizarlo e interactuar aquí mismo.
                        </p>
                      </div>
                    )}
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

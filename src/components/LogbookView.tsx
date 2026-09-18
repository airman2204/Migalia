import React, { useState } from 'react';
import { LogbookEntry, Partner } from '@/types';
import { BookOpen, Plus, Calendar, User, Tag, Video } from 'lucide-react';
import { MeetingRoomModal } from './MeetingRoomModal';

interface LogbookViewProps {
  entries: LogbookEntry[];
  partners: Partner[];
  currentPartner?: Partner | null;
  onAddEntry: (entry: Omit<LogbookEntry, 'id'>) => void;
}

export const LogbookView: React.FC<LogbookViewProps> = ({
  entries,
  partners,
  currentPartner,
  onAddEntry,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<LogbookEntry['category']>('Reunión & Acuerdos');
  const [authorId, setAuthorId] = useState(partners[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const author = partners.find((p) => p.id === authorId);
    onAddEntry({
      title,
      content,
      category,
      authorId,
      authorName: author ? author.shortName : 'Socio',
      date: new Date().toISOString().split('T')[0],
    });

    setTitle('');
    setContent('');
    setShowForm(false);
  };

  const getCategoryBadge = (cat: LogbookEntry['category']) => {
    switch (cat) {
      case 'Reunión & Acuerdos':
        return <span className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-[10px] font-bold px-2.5 py-0.5 rounded-full">Reunión & Acuerdos</span>;
      case 'Decisión de Negocio':
        return <span className="bg-[#EDF3EE] text-[#4A6B53] border border-[#CDE0D1] text-[10px] font-bold px-2.5 py-0.5 rounded-full">Decisión de Negocio</span>;
      case 'Hito Logrado':
        return <span className="bg-[#F8F6F0] text-[#C59B27] border border-[#E6DFD5] text-[10px] font-bold px-2.5 py-0.5 rounded-full">Hito Logrado</span>;
      default:
        return <span className="bg-[#FDF0ED] text-[#C84B31] border border-[#F5C6BC] text-[10px] font-bold px-2.5 py-0.5 rounded-full">Incidencia / Reto</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#221F1D] tracking-tight">
            Bitácora de Socios & Minutas
          </h2>
          <p className="text-xs text-[#6E665D]">
            Registro de acuerdos de inversión, recetas, decisiones de obra y temas clave.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Migalia Calls Studio (Nativo)</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-[#221F1D] hover:bg-[#34302C] text-[#F8F6F0] text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>{showForm ? 'Cerrar' : '+ Minuta Manual'}</span>
          </button>
        </div>
      </div>

      {/* Formulario nuevo acuerdo */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#FFFFFF] border border-[#C59B27] rounded-2xl p-5 shadow-sm space-y-4"
        >
          <h3 className="text-xs font-bold text-[#221F1D] uppercase tracking-wider">
            Nueva Entrada en Bitácora
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#6E665D] mb-1">
                Tipo de Entrada
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              >
                <option value="Reunión & Acuerdos">Reunión & Acuerdos</option>
                <option value="Decisión de Negocio">Decisión de Negocio</option>
                <option value="Hito Logrado">Hito Logrado</option>
                <option value="Incidencia / Reto">Incidencia / Reto</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#6E665D] mb-1">
                Registrado por
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#6E665D] mb-1">
              Título o Asunto del Acuerdo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Definición final del proveedor de hornos o distribución de CAPEX"
              className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#6E665D] mb-1">
              Contenido / Minuta Detallada
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe lo acordado con viñetas o notas claras..."
              className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-lg px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs px-3 py-1.5 text-[#6E665D] hover:text-[#221F1D]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="text-xs bg-[#221F1D] text-[#F8F6F0] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#34302C]"
            >
              Guardar en Bitácora
            </button>
          </div>
        </form>
      )}

      {/* Timeline Entries */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E6DFD5]">
        {entries.map((entry) => (
          <div key={entry.id} className="relative">
            {/* Dot on line */}
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#C59B27] border-2 border-[#F8F6F0]" />

            <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs space-y-2.5 hover:border-[#DDD5C7] transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(entry.category)}
                  <div className="flex items-center gap-1 text-[11px] text-[#A39E93]">
                    <Calendar className="w-3 h-3" />
                    <span>{entry.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[#6E665D] bg-[#F2EFE9] px-2.5 py-0.5 rounded-full font-medium">
                  <User className="w-3 h-3 text-[#8C6239]" />
                  <span>{entry.authorName}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#221F1D] leading-snug">
                {entry.title}
              </h3>

              <p className="text-xs text-[#6E665D] leading-relaxed whitespace-pre-line">
                {entry.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Sesión Meet con Dictado por Voz & Despacho de Correo */}
      <MeetingRoomModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        partners={partners}
        currentPartner={currentPartner}
        onSaveMinuta={(entry) => {
          onAddEntry(entry);
        }}
      />
    </div>
  );
};

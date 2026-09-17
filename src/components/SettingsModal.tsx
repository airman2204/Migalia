'use client';

import React, { useState } from 'react';
import { Partner } from '@/types';
import { Users, DollarSign, Save, X, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Partner[];
  onSavePartners: (partners: Partner[]) => void;
  budget: number;
  onSaveBudget: (budget: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  partners,
  onSavePartners,
  budget,
  onSaveBudget,
}) => {
  if (!isOpen) return null;

  const [localPartners, setLocalPartners] = useState<Partner[]>(partners);
  const [localBudget, setLocalBudget] = useState<number>(budget);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePartnerChange = (index: number, field: keyof Partner, value: string) => {
    const updated = [...localPartners];
    updated[index] = { ...updated[index], [field]: value };
    setLocalPartners(updated);
  };

  const handleAddPartner = () => {
    const nextNum = localPartners.length + 1;
    setLocalPartners([
      ...localPartners,
      {
        id: 'partner-' + Date.now(),
        name: `Socio ${nextNum}`,
        shortName: `Socio ${nextNum}`,
        email: `socio${nextNum}@migaliabakery.com`,
        role: 'Cofundador',
        avatar: `${nextNum}`,
      },
    ]);
  };

  const handleDeletePartner = (id: string) => {
    if (localPartners.length <= 1) {
      alert('Debe haber al menos 1 socio configurado.');
      return;
    }
    setLocalPartners(localPartners.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePartners(localPartners);
    onSaveBudget(localBudget);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#221F1D]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl w-full max-w-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFD5] bg-[#F8F6F0]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C59B27]" />
            <h3 className="text-sm font-bold text-[#221F1D]">
              Configuración del Proyecto & Socios
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6E665D] hover:bg-[#EBE7DF] hover:text-[#221F1D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {savedSuccess && (
            <div className="flex items-center gap-2 text-xs text-[#4A6B53] bg-[#EDF3EE] border border-[#CDE0D1] p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuración guardada exitosamente.</span>
            </div>
          )}

          {/* 1. Presupuesto CAPEX */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#8C6239]" />
              <label className="text-xs font-bold text-[#221F1D] uppercase tracking-wider">
                Presupuesto CAPEX Inicial (MXN)
              </label>
            </div>
            <p className="text-[11px] text-[#6E665D]">
              Monto total estimado para obra, equipamiento y reserva de apertura.
            </p>
            <div className="relative max-w-xs">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#8C6239]">$</span>
              <input
                type="number"
                value={localBudget}
                onChange={(e) => setLocalBudget(Number(e.target.value))}
                step="1000"
                className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl pl-8 pr-3 py-2.5 text-[#221F1D] font-bold focus:outline-none focus:border-[#C59B27]"
                required
              />
            </div>
          </div>

          {/* 2. Socios Cofundadores */}
          <div className="space-y-3 pt-3 border-t border-[#F2EFE9]">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#221F1D] uppercase tracking-wider">
                  Socios Cofundadores
                </label>
                <p className="text-[11px] text-[#6E665D]">
                  Edita los nombres y correos de cada socio para asignaciones y reportes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddPartner}
                className="flex items-center gap-1 text-xs font-semibold text-[#8C6239] hover:text-[#C59B27] bg-[#F8F6F0] px-3 py-1.5 rounded-xl border border-[#E6DFD5]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Socio</span>
              </button>
            </div>

            <div className="space-y-3">
              {localPartners.map((partner, index) => (
                <div
                  key={partner.id}
                  className="bg-[#F8F6F0] border border-[#E6DFD5] p-3.5 rounded-2xl space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8C6239] uppercase">
                      Socio #{index + 1}
                    </span>
                    {localPartners.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePartner(partner.id)}
                        className="text-[#A39E93] hover:text-[#C84B31] p-1"
                        title="Eliminar socio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6E665D] mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={partner.name}
                        onChange={(e) => handlePartnerChange(index, 'name', e.target.value)}
                        placeholder="Ej. Mario González"
                        className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#6E665D] mb-1">
                        Nombre Corto (Botones y Tarjetas)
                      </label>
                      <input
                        type="text"
                        value={partner.shortName}
                        onChange={(e) => handlePartnerChange(index, 'shortName', e.target.value)}
                        placeholder="Ej. Mario"
                        className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#6E665D] mb-1">
                        Correo (@migaliabakery.com)
                      </label>
                      <input
                        type="email"
                        value={partner.email}
                        onChange={(e) => handlePartnerChange(index, 'email', e.target.value)}
                        placeholder="socio@migaliabakery.com"
                        className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#6E665D] mb-1">
                        Rol / Responsabilidad
                      </label>
                      <input
                        type="text"
                        value={partner.role}
                        onChange={(e) => handlePartnerChange(index, 'role', e.target.value)}
                        placeholder="Ej. Operaciones & Recetas"
                        className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6DFD5]">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-4 py-2 text-[#6E665D] hover:text-[#221F1D]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs font-bold bg-[#221F1D] text-[#F8F6F0] px-5 py-2.5 rounded-xl hover:bg-[#34302C] shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

'use client'

import React, { useState } from 'react'
import { Contact } from '../lib/crmMockData'
import {
  Search,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  Building2,
  Tag,
  DollarSign,
  ChevronRight,
  MoreVertical,
  Filter,
  UserCheck
} from 'lucide-react'

interface PipelineProps {
  contacts: Contact[]
  onContactClick: (contact: Contact) => void
}

export default function CRMPipelineView({ contacts, onContactClick }: PipelineProps) {
  const stages: Contact['status'][] = [
    'Lead Nuevo',
    'En Negociación',
    'Propuesta Enviada',
    'Contratado / Ganado',
    'Perdido',
  ]

  const getStageBadgeColor = (stage: Contact['status']) => {
    switch (stage) {
      case 'Contratado / Ganado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'En Negociación':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Propuesta Enviada':
        return 'bg-sky-100 text-sky-800 border-sky-300'
      case 'Lead Nuevo':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-slate-100 text-slate-600 border-slate-300'
    }
  }

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2B1D19]">Embudo de Ventas & Negociaciones (Pipeline)</h2>
          <p className="text-xs text-[#7A6658]">Arrastra o gestiona las relaciones comerciales en cada etapa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageContacts = contacts.filter((c) => c.status === stage)
          const stageTotalValue = stageContacts.reduce((acc, curr) => acc + curr.value, 0)

          return (
            <div
              key={stage}
              className="bg-[#F1EAE1]/50 p-3.5 rounded-2xl border border-[#E2D7CB] flex flex-col min-h-[500px]"
            >
              {/* Header Etapa */}
              <div className="mb-3 pb-2 border-b border-[#E2D7CB]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2B1D19] uppercase tracking-wider">
                    {stage}
                  </span>
                  <span className="text-xs font-mono font-bold bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#E2D7CB] text-[#7A6658]">
                    {stageContacts.length}
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-[#A07835] mt-1">
                  ${stageTotalValue.toLocaleString('es-MX')} MXN
                </div>
              </div>

              {/* Lista de Tarjetas de Contacto */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {stageContacts.length === 0 ? (
                  <div className="text-center py-12 text-xs text-[#7A6658] border border-dashed border-[#E2D7CB] rounded-xl">
                    Sin contactos
                  </div>
                ) : (
                  stageContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => onContactClick(contact)}
                      className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2D7CB] shadow-sm hover:shadow-md hover:border-[#A07835] transition-all cursor-pointer space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F1EAE1] text-[#7A6658] border border-[#E2D7CB]">
                          {contact.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#2B1D19]">
                          ${contact.value.toLocaleString('es-MX')}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#2B1D19] group-hover:text-[#A07835] transition-colors leading-snug">
                          {contact.name}
                        </h4>
                        <p className="text-xs text-[#7A6658] font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-[#A07835]" /> {contact.company}
                        </p>
                      </div>

                      {contact.notes && (
                        <p className="text-[11px] text-[#7A6658] line-clamp-2 bg-[#FAF6EF] p-2 rounded-lg border border-[#E2D7CB]/50">
                          {contact.notes}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#F1EAE1] flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[#7A6658] font-mono">{contact.lastContact}</span>
                        <a
                          href={`https://wa.me/${contact.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

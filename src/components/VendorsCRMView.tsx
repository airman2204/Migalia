'use client'

import React, { useState } from 'react'
import { Vendor } from '../lib/mockData'
import { Phone, MessageCircle, Building2, Tag, Search, Plus } from 'lucide-react'

interface VendorProps {
  vendors: Vendor[]
}

export default function VendorsCRMView({ vendors: initialVendors }: VendorProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('Todas')

  const categories = ['Todas', 'Maquinaria', 'Café', 'Harinas/Materia Prima', 'Empaques']

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'Todas' || v.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status: Vendor['status']) => {
    switch (status) {
      case 'Aprobado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
      case 'Cotización Recibida':
        return 'bg-[#A07835]/15 text-[#A07835] border-[#A07835]/40 font-semibold'
      case 'Rechazado':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      default:
        return 'bg-[#F1EAE1] text-[#7A6658] border-[#E2D7CB]'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2B1D19]">Directorio de Proveedores (CRM)</h2>
          <p className="text-xs text-[#7A6658]">Gestión de contactos clave, cotizaciones y comunicación directa por WhatsApp</p>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#FFFFFF] p-3 rounded-2xl border border-[#E2D7CB] shadow-sm">
        <div className="flex items-center gap-2 bg-[#FAF6EF] px-3 py-2 rounded-xl border border-[#E2D7CB] flex-1 w-full">
          <Search className="w-4 h-4 text-[#7A6658]" />
          <input
            type="text"
            placeholder="Buscar proveedor o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-[#2B1D19] outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-[#2B1D19] text-[#FFFFFF]'
                  : 'bg-[#F1EAE1] text-[#7A6658] hover:text-[#2B1D19]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2D7CB] shadow-sm hover:border-[#A07835] transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F1EAE1] text-[#7A6658] border border-[#E2D7CB]">
                  {vendor.category}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-md border ${getStatusBadge(vendor.status)}`}>
                  {vendor.status}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#2B1D19]">{vendor.name}</h3>
              <p className="text-xs text-[#7A6658] font-medium mt-0.5">{vendor.service}</p>

              {vendor.notes && (
                <p className="text-xs text-[#7A6658]/90 bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E2D7CB]/60 mt-3 leading-relaxed">
                  "{vendor.notes}"
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[#F1EAE1] flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-[#7A6658] block">Monto Cotizado</span>
                <span className="text-sm font-mono font-bold text-[#2B1D19]">
                  ${vendor.quotedAmount.toLocaleString('es-MX')} MXN
                </span>
              </div>

              <a
                href={`https://wa.me/${vendor.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-[#FFFFFF] text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

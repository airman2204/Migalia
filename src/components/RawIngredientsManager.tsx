'use client';

import React, { useState } from 'react';
import { RawIngredient } from '@/types';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  Scale,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  X,
  Check,
  Building2,
  TrendingDown
} from 'lucide-react';

interface RawIngredientsManagerProps {
  rawIngredients: RawIngredient[];
  onSaveIngredient: (ingredient: RawIngredient) => void;
  onDeleteIngredient: (id: string) => void;
  onClose?: () => void;
}

export const RawIngredientsManager: React.FC<RawIngredientsManagerProps> = ({
  rawIngredients,
  onSaveIngredient,
  onDeleteIngredient,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<RawIngredient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Harinas & Polvos');
  const [formPurchasePackage, setFormPurchasePackage] = useState('Bulto 25 kg');
  const [formPackageQuantity, setFormPackageQuantity] = useState<number | string>(25);
  const [formPackageUnit, setFormPackageUnit] = useState<'KG' | 'LT' | 'PZA' | 'G' | 'ML'>('KG');
  const [formPackageCost, setFormPackageCost] = useState<number | string>(550);
  const [formYield, setFormYield] = useState<number | string>(100);
  const [formSupplier, setFormSupplier] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const categories = [
    'all',
    'Harinas & Polvos',
    'Lácteos & Grasas',
    'Azúcares',
    'Chocolates & Coberturas',
    'Frutas & Frutos Secos',
    'Especias & Extractos',
    'Empaques',
    'Otros',
  ];

  // Cálculo en vivo del costo unitario base
  const calculateCostPerBase = (
    pkgQty: number,
    pkgUnit: 'KG' | 'LT' | 'PZA' | 'G' | 'ML',
    pkgCost: number,
    yieldPct: number = 100
  ) => {
    if (!pkgQty || pkgQty <= 0 || !pkgCost || pkgCost <= 0) return { cost: 0, unit: 'KG' as const };
    const effectiveYield = Math.max(1, Math.min(100, yieldPct || 100)) / 100;

    let baseQty = pkgQty;
    let baseUnit: 'KG' | 'LT' | 'PZA' = 'KG';

    if (pkgUnit === 'G') {
      baseQty = pkgQty / 1000;
      baseUnit = 'KG';
    } else if (pkgUnit === 'ML') {
      baseQty = pkgQty / 1000;
      baseUnit = 'LT';
    } else if (pkgUnit === 'LT') {
      baseUnit = 'LT';
    } else if (pkgUnit === 'PZA') {
      baseUnit = 'PZA';
    } else {
      baseUnit = 'KG';
    }

    const usableQty = baseQty * effectiveYield;
    const costPerBase = usableQty > 0 ? pkgCost / usableQty : 0;
    return {
      cost: Math.round(costPerBase * 100) / 100,
      unit: baseUnit,
    };
  };

  const previewCalc = calculateCostPerBase(
    Number(formPackageQuantity) || 0,
    formPackageUnit,
    Number(formPackageCost) || 0,
    Number(formYield) || 100
  );

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Harinas & Polvos');
    setFormPurchasePackage('Bulto / Costal 25 kg');
    setFormPackageQuantity(25);
    setFormPackageUnit('KG');
    setFormPackageCost(550);
    setFormYield(100);
    setFormSupplier('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleEdit = (item: RawIngredient) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category || 'Harinas & Polvos');
    setFormPurchasePackage(item.purchasePackage);
    setFormPackageQuantity(item.packageQuantity);
    setFormPackageUnit(item.packageUnit);
    setFormPackageCost(item.packageCost);
    setFormYield(item.yieldPercentage || 100);
    setFormSupplier(item.supplier || '');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const calc = calculateCostPerBase(
      Number(formPackageQuantity) || 1,
      formPackageUnit,
      Number(formPackageCost) || 0,
      Number(formYield) || 100
    );

    const saved: RawIngredient = {
      id: editingItem ? editingItem.id : 'raw-' + Date.now(),
      name: formName.trim().toUpperCase(),
      category: formCategory,
      purchasePackage: formPurchasePackage.trim() || `${formPackageQuantity} ${formPackageUnit}`,
      packageQuantity: Number(formPackageQuantity) || 1,
      packageUnit: formPackageUnit,
      packageCost: Number(formPackageCost) || 0,
      yieldPercentage: Number(formYield) || 100,
      costPerBaseUnit: calc.cost,
      baseUnit: calc.unit,
      supplier: formSupplier.trim() || undefined,
      notes: formNotes.trim() || undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveIngredient(saved);
    setIsModalOpen(false);
  };

  const filteredItems = rawIngredients.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      (item.supplier && item.supplier.toLowerCase().includes(q)) ||
      (item.purchasePackage && item.purchasePackage.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E6DFD5] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold font-serif text-[#221F1D]">
              Catálogo Maestro de Insumos & Materias Primas
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {rawIngredients.length} Insumos Activos
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Registra bultos, costales, cajas o presentaciones mayoristas con su precio real pagado.
            El sistema desglosará automáticamente el costo exacto por <strong>gramo</strong>, <strong>mililitro</strong> o <strong>pieza</strong> en cada receta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all"
            >
              Volver a Recetas
            </button>
          )}
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#221F1D] text-amber-400 hover:bg-stone-800 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Alta de Insumo / Costal</span>
          </button>
        </div>
      </div>

      {/* Ejemplos Didácticos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-xs font-bold">
            25kg
          </div>
          <div>
            <p className="text-xs font-bold text-[#221F1D]">Bulto de Harina (25 kg en $550)</p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Equivale a <strong>$22.00 / kg</strong> ($0.022/g).
              <br />
              <span className="text-emerald-700 font-semibold">300 g en tu receta = $6.60 MXN</span>
            </p>
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-xs font-bold">
            10kg
          </div>
          <div>
            <p className="text-xs font-bold text-[#221F1D]">Mantequilla 10 kg en $1,600</p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Equivale a <strong>$160.00 / kg</strong> ($0.16/g).
              <br />
              <span className="text-emerald-700 font-semibold">350 g en tu receta = $56.00 MXN</span>
            </p>
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-xs font-bold">
            1k
          </div>
          <div>
            <p className="text-xs font-bold text-[#221F1D]">Empaque Conos (1,000 pzas en $3,200)</p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Equivale a <strong>$3.20 / cono</strong>.
              <br />
              <span className="text-emerald-700 font-semibold">20 conos por lote = $64.00 MXN</span>
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl border border-[#E6DFD5] p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar insumo (ej. Harina, Mantequilla, Azúcar)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E6DFD5] bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-amber-500 text-[#221F1D]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#221F1D] text-amber-400 font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'all' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Insumos */}
      <div className="bg-white rounded-2xl border border-[#E6DFD5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E6DFD5] text-[10px] uppercase font-bold tracking-wider text-stone-500">
                <th className="py-3 px-4">Materia Prima / Insumo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Presentación de Compra</th>
                <th className="py-3 px-4 text-right">Precio de Compra</th>
                <th className="py-3 px-4 text-center">Rendimiento</th>
                <th className="py-3 px-4 text-right font-bold text-amber-800">Costo Base Calculado</th>
                <th className="py-3 px-4 text-right">Ej. 300g / 300ml</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">No se encontraron insumos con ese criterio.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const costPerGram = item.baseUnit === 'PZA' ? item.costPerBaseUnit : item.costPerBaseUnit / 1000;
                  const exampleCost = item.baseUnit === 'PZA' ? item.costPerBaseUnit : costPerGram * 300;

                  return (
                    <tr key={item.id} className="hover:bg-[#FCFBF9] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#221F1D]">{item.name}</div>
                        {item.supplier && (
                          <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            <span>{item.supplier}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {item.purchasePackage}
                        <span className="text-[10px] text-stone-400 block">
                          ({item.packageQuantity} {item.packageUnit})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-stone-800">
                        ${Number(item.packageCost).toFixed(2)} MXN
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-medium text-stone-600">
                          {item.yieldPercentage || 100}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded-lg inline-block border border-amber-200">
                          ${item.costPerBaseUnit.toFixed(2)} / {item.baseUnit}
                        </div>
                        {item.baseUnit !== 'PZA' && (
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            (${costPerGram.toFixed(4)} / {item.baseUnit === 'KG' ? 'g' : 'ml'})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ${exampleCost.toFixed(2)} MXN
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
                            title="Editar insumo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar ${item.name} del catálogo maestro?`)) {
                                onDeleteIngredient(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Eliminar insumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Alta / Edición de Insumo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E6DFD5] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#E6DFD5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif text-[#221F1D]">
                    {editingItem ? 'Editar Materia Prima' : 'Registrar Nuevo Insumo / Bulto'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Define la presentación de compra para calcular el costo por gramo en recetas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. HARINA DE TRIGO TODO USO (FLOR DE PUEBLA)"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[#E6DFD5] bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase text-[#221F1D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-[#E6DFD5] bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-[#221F1D]"
                  >
                    {categories.filter((c) => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Proveedor (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="Ej. Molino, Central de Abastos, Costco"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6DFD5] bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-[#221F1D]"
                  />
                </div>
              </div>

              {/* Presentación Comercial de Compra */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                    Presentación de Compra Mayorista / Minorista
                  </span>
                  <span className="text-[10px] text-stone-500">¿Cómo lo compras en el mercado?</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">
                      Descripción Empaque
                    </label>
                    <input
                      type="text"
                      value={formPurchasePackage}
                      onChange={(e) => setFormPurchasePackage(e.target.value)}
                      placeholder="Ej. Bulto 25 kg, Caja 10 kg"
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#E6DFD5] bg-white text-[#221F1D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">
                      Contenido Neto
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="any"
                        min="0.001"
                        required
                        value={formPackageQuantity}
                        onChange={(e) => setFormPackageQuantity(e.target.value)}
                        placeholder="25"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#E6DFD5] bg-white text-center font-bold text-[#221F1D]"
                      />
                      <select
                        value={formPackageUnit}
                        onChange={(e) => setFormPackageUnit(e.target.value as any)}
                        className="text-xs px-2 py-1.5 rounded-lg border border-[#E6DFD5] bg-white font-bold text-[#221F1D]"
                      >
                        <option value="KG">KG</option>
                        <option value="LT">LT</option>
                        <option value="PZA">PZA</option>
                        <option value="G">G (Gramos)</option>
                        <option value="ML">ML (Mililitros)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">
                      Precio Pagado (MXN) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-stone-400">$</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={formPackageCost}
                        onChange={(e) => setFormPackageCost(e.target.value)}
                        placeholder="550.00"
                        className="w-full text-xs pl-6 pr-2.5 py-1.5 rounded-lg border border-[#E6DFD5] bg-white font-bold text-[#221F1D]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-medium text-stone-600 mb-1">
                      Rendimiento Utilizable (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="100"
                        value={formYield}
                        onChange={(e) => setFormYield(e.target.value)}
                        placeholder="100"
                        className="w-20 text-xs px-2.5 py-1.5 rounded-lg border border-[#E6DFD5] bg-white text-center text-[#221F1D]"
                      />
                      <span className="text-[11px] text-stone-500">
                        {formYield === '100' || formYield === 100
                          ? '100% (Sin merma)'
                          : `${formYield}% (Aprovechamiento neto)`}
                      </span>
                    </div>
                  </div>

                  {/* Resumen del Costo Unitario Calculado */}
                  <div className="bg-amber-100/60 p-2.5 rounded-xl border border-amber-300 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wider">
                      Costo Resultante en Receta:
                    </span>
                    <span className="text-sm font-extrabold text-amber-950 mt-0.5">
                      ${previewCalc.cost.toFixed(2)} MXN / {previewCalc.unit}
                    </span>
                    {previewCalc.unit !== 'PZA' && (
                      <span className="text-[10px] text-amber-800 font-medium">
                        (${(previewCalc.cost / 1000).toFixed(4)} por {previewCalc.unit === 'KG' ? 'gramo' : 'mililitro'})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Notas / Especificaciones (Opcional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ej. Mantener en lugar fresco y seco, marca favorita"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E6DFD5] bg-white text-[#221F1D]"
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6DFD5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#221F1D] text-amber-400 hover:bg-stone-800 transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Guardar Cambios' : 'Dar de Alta Insumo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

'use client'

import React, { useState } from 'react'
import { StandardRecipe, StandardIngredient } from '../lib/recipeTypes'
import { Plus, Trash2, FileText, ArrowLeft, Check, ChefHat } from 'lucide-react'

interface RecipeFormProps {
  initialData?: StandardRecipe | null
  onSave: (recipe: StandardRecipe) => void
  onCancel: () => void
}

export default function RecipeForm({ initialData, onSave, onCancel }: RecipeFormProps) {
  const [recipeName, setRecipeName] = useState(initialData?.recipeName || '')
  const [yieldServings, setYieldServings] = useState(initialData?.yieldServings || '10 PERSONA')
  const [presentation, setPresentation] = useState(initialData?.presentation || 'ENTRADA CALIENTE')
  const [headerSubTitle, setHeaderSubTitle] = useState(initialData?.headerSubTitle || 'Recetario estandarizado a 10 personas y costeado')
  const [institutionName, setInstitutionName] = useState(initialData?.institutionName || 'MIGALIA Panadería & Café')

  const [ingredients, setIngredients] = useState<StandardIngredient[]>(
    initialData?.ingredients || [
      { id: '1', name: 'QUESO CHIHUAHUA', grammage: 0.25, unit: 'KG', costUnit: 0, costTotal: 0 },
      { id: '2', name: 'QUESO PARMESANO', grammage: 0.25, unit: 'KG', costUnit: 0, costTotal: 0 },
    ]
  )

  const [miseEnPlace, setMiseEnPlace] = useState<string[]>(
    initialData?.miseEnPlace || ['Rallar queso chihuahua y parmesano', 'Cortar en jardinera el jitomate']
  )

  const [preparation, setPreparation] = useState<string[]>(
    initialData?.preparation || ['Poner sobre la plancha el queso para hacer la costra']
  )

  // Handlers Ingredientes
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: '', grammage: 0, unit: 'KG', costUnit: 0, costTotal: 0 },
    ])
  }

  const updateIngredient = (index: number, field: keyof StandardIngredient, value: any) => {
    const updated = [...ingredients]
    const item = { ...updated[index], [field]: value }
    // Autocalcular Costo Total si hay C/U y Gramaje
    if (field === 'grammage' || field === 'costUnit') {
      const g = field === 'grammage' ? parseFloat(value) || 0 : item.grammage
      const cu = field === 'costUnit' ? parseFloat(value) || 0 : item.costUnit || 0
      item.costTotal = g * cu
    }
    updated[index] = item
    setIngredients(updated)
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  // Handlers Mise En Place
  const addMiseStep = () => setMiseEnPlace([...miseEnPlace, ''])
  const updateMiseStep = (idx: number, val: string) => {
    const updated = [...miseEnPlace]
    updated[idx] = val
    setMiseEnPlace(updated)
  }
  const removeMiseStep = (idx: number) => setMiseEnPlace(miseEnPlace.filter((_, i) => i !== idx))

  // Handlers Preparación
  const addPrepStep = () => setPreparation([...preparation, ''])
  const updatePrepStep = (idx: number, val: string) => {
    const updated = [...preparation]
    updated[idx] = val
    setPreparation(updated)
  }
  const removePrepStep = (idx: number) => setPreparation(preparation.filter((_, i) => i !== idx))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipeName.trim()) return alert('Ingresa el nombre de la receta')

    const newRecipe: StandardRecipe = {
      id: initialData?.id || `rec-${Date.now()}`,
      recipeName: recipeName.toUpperCase(),
      yieldServings: yieldServings.toUpperCase(),
      presentation: presentation.toUpperCase(),
      headerSubTitle,
      institutionName,
      ingredients: ingredients.filter((ing) => ing.name.trim() !== ''),
      miseEnPlace: miseEnPlace.filter((step) => step.trim() !== ''),
      preparation: preparation.filter((step) => step.trim() !== ''),
    }

    onSave(newRecipe)
  }

  return (
    <div className="bg-[#FFFFFF] p-6 md:p-8 rounded-3xl border border-[#E2D7CB] shadow-sm max-w-4xl mx-auto space-y-8 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2D7CB]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-[#7A6658] hover:text-[#2B1D19] bg-[#F1EAE1] rounded-xl border border-[#E2D7CB] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2B1D19]">
              {initialData ? 'Editar Receta Estandarizada' : 'Alta de Nueva Receta Estandarizada'}
            </h2>
            <p className="text-xs text-[#7A6658]">Captura de parámetros e ingredientes de la ficha técnica institucional</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ENCABEZADOS PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF6EF] p-5 rounded-2xl border border-[#E2D7CB]">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-[#7A6658] uppercase mb-1">
              Subtítulo General de Formato
            </label>
            <input
              type="text"
              value={headerSubTitle}
              onChange={(e) => setHeaderSubTitle(e.target.value)}
              className="w-full p-2.5 bg-[#FFFFFF] border rounded-xl border-[#E2D7CB] text-xs text-[#2B1D19] outline-none"
              placeholder="Recetario estandarizado a 10 personas y costeado"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#7A6658] uppercase mb-1">
              Institución / Logo de Ficha (Sin Logo Migalia)
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full p-2.5 bg-[#FFFFFF] border rounded-xl border-[#E2D7CB] text-xs text-[#2B1D19] outline-none"
              placeholder="Instituto Suizo de Gastronomía y Hotelería"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#7A6658] uppercase mb-1">
              Nombre de la Receta *
            </label>
            <input
              type="text"
              required
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="w-full p-2.5 bg-[#FFFFFF] border rounded-xl border-[#E2D7CB] text-sm font-bold text-[#2B1D19] outline-none uppercase"
              placeholder="COSTRA DE QUESO"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#7A6658] uppercase mb-1">
              Rendimiento
            </label>
            <input
              type="text"
              value={yieldServings}
              onChange={(e) => setYieldServings(e.target.value)}
              className="w-full p-2.5 bg-[#FFFFFF] border rounded-xl border-[#E2D7CB] text-xs text-[#2B1D19] outline-none uppercase"
              placeholder="10 PERSONA"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#7A6658] uppercase mb-1">
              Presentación
            </label>
            <input
              type="text"
              value={presentation}
              onChange={(e) => setPresentation(e.target.value)}
              className="w-full p-2.5 bg-[#FFFFFF] border rounded-xl border-[#E2D7CB] text-xs text-[#2B1D19] outline-none uppercase"
              placeholder="ENTRADA CALIENTE"
            />
          </div>
        </div>

        {/* TABLA DE INGREDIENTES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#2B1D19] uppercase tracking-wider">
              Ingredientes
            </h3>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1EAE1] hover:bg-[#E2D7CB] text-[#2B1D19] text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4 text-[#A07835]" />
              <span>Agregar Ingrediente</span>
            </button>
          </div>

          <div className="border border-[#E2D7CB] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#2B1D19] text-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Ingrediente</th>
                  <th className="p-3 w-24 text-right">Gramaje</th>
                  <th className="p-3 w-20 text-center">Unidad</th>
                  <th className="p-3 w-24 text-right">C/U ($)</th>
                  <th className="p-3 w-24 text-right">C/T ($)</th>
                  <th className="p-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D7CB]/60 bg-[#FFFFFF]">
                {ingredients.map((ing, idx) => (
                  <tr key={ing.id || idx}>
                    <td className="p-2">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => updateIngredient(idx, 'name', e.target.value.toUpperCase())}
                        placeholder="NOMBRE DEL INGREDIENTE"
                        className="w-full p-1.5 bg-[#FAF6EF] border border-[#E2D7CB] rounded-lg text-xs uppercase font-medium outline-none"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        step="0.001"
                        value={ing.grammage || ''}
                        onChange={(e) => updateIngredient(idx, 'grammage', e.target.value)}
                        placeholder="0.250"
                        className="w-full p-1.5 bg-[#FAF6EF] border border-[#E2D7CB] rounded-lg text-xs text-right font-mono outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={ing.unit}
                        onChange={(e) => updateIngredient(idx, 'unit', e.target.value.toUpperCase())}
                        placeholder="KG"
                        className="w-full p-1.5 bg-[#FAF6EF] border border-[#E2D7CB] rounded-lg text-xs text-center font-bold outline-none"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={ing.costUnit || ''}
                        onChange={(e) => updateIngredient(idx, 'costUnit', e.target.value)}
                        placeholder="0.00"
                        className="w-full p-1.5 bg-[#FAF6EF] border border-[#E2D7CB] rounded-lg text-xs text-right font-mono outline-none"
                      />
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-[#2B1D19]">
                      ${(ing.costTotal || 0).toFixed(2)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="p-1 text-[#7A6658] hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MISE EN PLACE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#2B1D19] uppercase tracking-wider">
              Mise En Place
            </h3>
            <button
              type="button"
              onClick={addMiseStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1EAE1] hover:bg-[#E2D7CB] text-[#2B1D19] text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4 text-[#A07835]" />
              <span>Agregar Paso</span>
            </button>
          </div>

          <div className="space-y-2">
            {miseEnPlace.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7A6658] font-mono w-6 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updateMiseStep(idx, e.target.value)}
                  className="flex-1 p-2 bg-[#FAF6EF] border border-[#E2D7CB] rounded-xl text-xs text-[#2B1D19] outline-none"
                  placeholder="Instrucción de Mise En Place..."
                />
                <button
                  type="button"
                  onClick={() => removeMiseStep(idx)}
                  className="p-1.5 text-[#7A6658] hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PREPARACIÓN */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#2B1D19] uppercase tracking-wider">
              Preparación
            </h3>
            <button
              type="button"
              onClick={addPrepStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1EAE1] hover:bg-[#E2D7CB] text-[#2B1D19] text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4 text-[#A07835]" />
              <span>Agregar Paso</span>
            </button>
          </div>

          <div className="space-y-2">
            {preparation.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7A6658] font-mono w-6 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updatePrepStep(idx, e.target.value)}
                  className="flex-1 p-2 bg-[#FAF6EF] border border-[#E2D7CB] rounded-xl text-xs text-[#2B1D19] outline-none"
                  placeholder="Paso de preparación..."
                />
                <button
                  type="button"
                  onClick={() => removePrepStep(idx)}
                  className="p-1.5 text-[#7A6658] hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ACCIONES DE GUARDADO */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2D7CB]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-[#F1EAE1] hover:bg-[#E2D7CB] text-[#2B1D19] text-xs font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2B1D19] hover:bg-[#382820] text-[#FFFFFF] text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Guardar Receta</span>
          </button>
        </div>
      </form>
    </div>
  )
}

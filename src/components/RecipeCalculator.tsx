'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Calculator } from 'lucide-react'

interface Ingredient {
  name: string
  costPerKgOrLiter: number
  gramsPerPortion: number
}

export default function RecipeCalculator() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: 'Harina de Trigo Especial', costPerKgOrLiter: 24, gramsPerPortion: 250 },
    { name: 'Mantequilla 82% Grasa', costPerKgOrLiter: 190, gramsPerPortion: 125 },
    { name: 'Azúcar Refinada', costPerKgOrLiter: 30, gramsPerPortion: 80 },
  ])
  const [recipeName, setRecipeName] = useState<string>('Croissant Clásico Mantequilla')
  const [targetMargin, setTargetMargin] = useState<number>(75)

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', costPerKgOrLiter: 0, gramsPerPortion: 0 }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index))
  }

  const foodCost = ingredients.reduce((total, ing) => {
    const costPerGram = (ing.costPerKgOrLiter || 0) / 1000
    return total + costPerGram * (ing.gramsPerPortion || 0)
  }, 0)

  const suggestedPrice = targetMargin < 100 ? foodCost / (1 - targetMargin / 100) : 0

  return (
    <div className="p-6 bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2D7CB] space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#E2D7CB]">
        <div className="p-2 bg-[#F1EAE1] text-[#A07835] rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2B1D19]">Escandallo Maestro de Recetas</h2>
          <p className="text-xs text-[#7A6658]">Calculadora de costo directo por porción (Food Cost) y margen de utilidad</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#7A6658] mb-1.5 uppercase tracking-wider">
          Nombre de la Receta / Producto
        </label>
        <input
          type="text"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          className="w-full p-3 border rounded-xl border-[#E2D7CB] bg-[#FAF6EF] text-[#2B1D19] font-serif font-bold text-lg outline-none focus:border-[#A07835]"
          placeholder="Ej. Croissant de Mantequilla"
        />
      </div>

      {/* Lista de ingredientes */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-[#7A6658] uppercase px-2">
          <span className="col-span-5">Ingrediente</span>
          <span className="col-span-3 text-right">Costo / Kg o L ($)</span>
          <span className="col-span-3 text-right">Gramos o ml / Porción</span>
          <span className="col-span-1 text-center"></span>
        </div>

        {ingredients.map((ing, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#FAF6EF] p-2 rounded-xl border border-[#E2D7CB]/80">
            <input
              type="text"
              placeholder="Ingrediente"
              value={ing.name}
              onChange={(e) => {
                const newIngs = [...ingredients]
                newIngs[idx].name = e.target.value
                setIngredients(newIngs)
              }}
              className="col-span-5 p-2 bg-[#FFFFFF] border rounded-lg border-[#E2D7CB] text-xs text-[#2B1D19] outline-none"
            />
            <input
              type="number"
              placeholder="0.00"
              value={ing.costPerKgOrLiter || ''}
              onChange={(e) => {
                const newIngs = [...ingredients]
                newIngs[idx].costPerKgOrLiter = parseFloat(e.target.value) || 0
                setIngredients(newIngs)
              }}
              className="col-span-3 p-2 bg-[#FFFFFF] border rounded-lg border-[#E2D7CB] text-xs text-[#2B1D19] text-right font-mono outline-none"
            />
            <input
              type="number"
              placeholder="0"
              value={ing.gramsPerPortion || ''}
              onChange={(e) => {
                const newIngs = [...ingredients]
                newIngs[idx].gramsPerPortion = parseFloat(e.target.value) || 0
                setIngredients(newIngs)
              }}
              className="col-span-3 p-2 bg-[#FFFFFF] border rounded-lg border-[#E2D7CB] text-xs text-[#2B1D19] text-right font-mono outline-none"
            />
            <button
              onClick={() => removeIngredient(idx)}
              className="col-span-1 flex justify-center text-[#7A6658] hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          onClick={addIngredient}
          className="flex items-center gap-2 text-xs font-semibold text-[#A07835] hover:underline pt-2"
        >
          <Plus className="w-4 h-4" /> Agregar ingrediente
        </button>
      </div>

      {/* Métricas */}
      <div className="p-5 bg-[#F1EAE1] rounded-2xl border border-[#E2D7CB] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <span className="text-xs text-[#7A6658] block font-medium">Food Cost Directo:</span>
          <span className="text-2xl font-serif font-bold text-[#2B1D19]">${foodCost.toFixed(2)} MXN</span>
        </div>

        <div>
          <span className="text-xs text-[#7A6658] block font-medium">Margen Proyectado:</span>
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
              className="w-16 p-1 bg-[#FFFFFF] border border-[#E2D7CB] rounded-lg text-center text-xs font-bold text-[#2B1D19]"
            />
            <span className="text-xs font-bold text-[#2B1D19]">%</span>
          </div>
        </div>

        <div className="md:text-right">
          <span className="text-xs text-[#A07835] block font-bold uppercase tracking-wider">Precio Sugerido (PVP):</span>
          <span className="text-3xl font-serif font-extrabold text-[#2B1D19]">${suggestedPrice.toFixed(2)} MXN</span>
        </div>
      </div>
    </div>
  )
}

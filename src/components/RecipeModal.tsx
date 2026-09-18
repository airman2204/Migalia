'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Recipe, RecipeIngredient } from '@/types';
import { X, Plus, Trash2, Calculator, Layers, ArrowDown } from 'lucide-react';

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe: (recipe: Recipe) => void;
  onDeleteRecipe?: (recipeId: string) => void;
}

// Convierte valores numéricos, enteros y fracciones como '1/2', '1/4', '3/4', '1 1/2' a decimal para el cálculo de costos
export function parseFractionToDecimal(val: string | number): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).trim();
  if (!str) return 0;

  // Fracción mixta: ej. "1 1/2"
  if (str.includes(' ')) {
    const parts = str.split(' ');
    const whole = parseFloat(parts[0]) || 0;
    const fraction = parseFractionToDecimal(parts[1]);
    return whole + fraction;
  }

  // Fracción simple: ej. "1/2", "1/4", "3/4"
  if (str.includes('/')) {
    const [num, den] = str.split('/').map((s) => parseFloat(s.trim()));
    if (den && !isNaN(num) && !isNaN(den) && den !== 0) {
      return num / den;
    }
  }

  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onSaveRecipe,
  onDeleteRecipe,
}) => {
  const [title, setTitle] = useState(recipe?.title || '');
  const [yieldCount, setYieldCount] = useState(recipe?.yieldCount || '10 PERSONAS');
  const [presentation, setPresentation] = useState(recipe?.presentation || 'CAJA GIFTABLE / VITRINA');
  const [standardizedFor, setStandardizedFor] = useState(recipe?.standardizedFor || 'Recetario estandarizado y costeado');
  const [category, setCategory] = useState(recipe?.category || 'Repostería Insignia');
  const [notes, setNotes] = useState(recipe?.notes || '');
  const [titleError, setTitleError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ingredientes
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipe?.ingredients && recipe.ingredients.length > 0
      ? recipe.ingredients
      : [
          { id: 'ing-' + Date.now() + '-1', name: '', quantity: '', unit: 'KG', unitCost: 0, totalCost: 0 },
        ]
  );

  // Mise en Place & Preparación
  const [miseEnPlace, setMiseEnPlace] = useState<string[]>(
    recipe?.miseEnPlace && recipe.miseEnPlace.length > 0 ? recipe.miseEnPlace : ['']
  );
  const [preparation, setPreparation] = useState<string[]>(
    recipe?.preparation && recipe.preparation.length > 0 ? recipe.preparation : ['']
  );

  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setTitle(recipe?.title || '');
      setYieldCount(recipe?.yieldCount || '10 PERSONAS');
      setPresentation(recipe?.presentation || 'CAJA GIFTABLE / VITRINA');
      setStandardizedFor(recipe?.standardizedFor || 'Recetario estandarizado y costeado');
      setCategory(recipe?.category || 'Repostería Insignia');
      setNotes(recipe?.notes || '');
      setTitleError(false);

      setIngredients(
        recipe?.ingredients && recipe.ingredients.length > 0
          ? [...recipe.ingredients]
          : [
              {
                id: 'ing-' + Date.now() + '-1',
                name: '',
                quantity: '',
                unit: 'KG',
                unitCost: 0,
                totalCost: 0,
              },
            ]
      );

      setMiseEnPlace(
        recipe?.miseEnPlace && recipe.miseEnPlace.length > 0
          ? [...recipe.miseEnPlace]
          : ['']
      );

      setPreparation(
        recipe?.preparation && recipe.preparation.length > 0
          ? [...recipe.preparation]
          : ['']
      );
    }

    prevIsOpenRef.current = isOpen;
  }, [isOpen, recipe]);

  if (!isOpen) return null;

  // Manejo de Ingredientes
  const handleIngredientChange = (idx: number, field: keyof RecipeIngredient, val: any) => {
    const updated = [...ingredients];
    const current = { ...updated[idx], [field]: val };

    if (field === 'quantity' || field === 'unitCost') {
      const q = field === 'quantity' ? parseFractionToDecimal(val) : parseFractionToDecimal(current.quantity);
      const c = field === 'unitCost' ? Number(val) || 0 : Number(current.unitCost) || 0;
      current.totalCost = Math.round(q * c * 100) / 100;
    }

    updated[idx] = current;
    setIngredients(updated);
  };

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: 'ing-' + Date.now(), name: '', quantity: '', unit: 'KG', unitCost: 0, totalCost: 0 },
    ]);
  };

  const handleAddSubrecipeTitle = () => {
    setIngredients([
      ...ingredients,
      { id: 'sub-' + Date.now(), name: 'SUB-RECETA: ', quantity: 0, unit: 'C/S', unitCost: 0, totalCost: 0, isSubrecipeTitle: true },
    ]);
  };

  const handleDeleteIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  // Mise en Place
  const handleMiseChange = (idx: number, val: string) => {
    const updated = [...miseEnPlace];
    updated[idx] = val;
    setMiseEnPlace(updated);
  };

  const handleAddMise = () => setMiseEnPlace([...miseEnPlace, '']);
  const handleDeleteMise = (idx: number) => setMiseEnPlace(miseEnPlace.filter((_, i) => i !== idx));

  // Preparación
  const handlePrepChange = (idx: number, val: string) => {
    const updated = [...preparation];
    updated[idx] = val;
    setPreparation(updated);
  };

  const handleAddPrep = () => setPreparation([...preparation, '']);
  const handleDeletePrep = (idx: number) => setPreparation(preparation.filter((_, i) => i !== idx));

  // Total de Costo
  const totalCost = ingredients
    .filter((ing) => !ing.isSubrecipeTitle)
    .reduce((sum, ing) => sum + (Number(ing.totalCost) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveRecipe({
        id: recipe?.id || 'rec-' + Date.now(),
        title: title.trim().toUpperCase(),
        yieldCount: yieldCount.trim().toUpperCase(),
        presentation: presentation.trim().toUpperCase(),
        standardizedFor,
        category,
        ingredients: ingredients.filter((ing) => ing.name.trim() !== ''),
        miseEnPlace: miseEnPlace.filter((m) => m.trim() !== ''),
        preparation: preparation.filter((p) => p.trim() !== ''),
        notes,
        createdAt: recipe?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (err) {
      console.error('Error submitting recipe:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#221F1D]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E6DFD5] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6DFD5] bg-[#F8F6F0] shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#221F1D]">
              {recipe ? 'Editar Ficha Técnica de Receta' : 'Nueva Ficha Técnica de Receta'}
            </h3>
            <p className="text-[11px] text-[#6E665D]">
              Formato gastronómico estandarizado y costeo de materia prima por rendimiento.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#6E665D] hover:bg-[#EBE7DF] hover:text-[#221F1D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Fila 1: Encabezado General */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#221F1D] uppercase mb-1">
                Nombre de la Receta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) setTitleError(false);
                }}
                placeholder="Ej. COOKIE FRIES CON DIP DE MARACUYÁ"
                className={`w-full text-xs font-semibold bg-[#FFFFFF] border rounded-xl px-3 py-2 text-[#221F1D] uppercase focus:outline-none ${
                  titleError ? 'border-red-500 ring-2 ring-red-200' : 'border-[#E6DFD5] focus:border-[#C59B27]'
                }`}
                required
              />
              {titleError && (
                <p className="text-[10px] text-red-600 font-bold mt-1">Por favor escribe el nombre de la receta.</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#221F1D] uppercase mb-1">
                Categoría
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Galletas / Bebidas / Pan"
                className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] uppercase mb-1">
                Rendimiento
              </label>
              <input
                type="text"
                value={yieldCount}
                onChange={(e) => setYieldCount(e.target.value)}
                placeholder="Ej. 10 PERSONAS / 24 PZAS"
                className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] uppercase focus:outline-none focus:border-[#C59B27]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] uppercase mb-1">
                Presentación
              </label>
              <input
                type="text"
                value={presentation}
                onChange={(e) => setPresentation(e.target.value)}
                placeholder="Ej. CONO KRAFT CON TINTERO"
                className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] uppercase focus:outline-none focus:border-[#C59B27]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6E665D] uppercase mb-1">
                Título Superior Ficha
              </label>
              <input
                type="text"
                value={standardizedFor}
                onChange={(e) => setStandardizedFor(e.target.value)}
                placeholder="Recetario estandarizado y costeado"
                className="w-full text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
              />
            </div>
          </div>

          {/* Fila 2: Tabla de Ingredientes y Escandallo */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#C59B27]" />
                <h4 className="font-bold text-[#221F1D] text-xs uppercase tracking-wider">
                  Tabla de Ingredientes & Costeo (Escandallo)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSubrecipeTitle}
                  className="text-[11px] font-semibold text-[#8C6239] hover:text-[#C59B27] bg-[#F8F6F0] border border-[#E6DFD5] px-2.5 py-1 rounded-lg"
                >
                  + Sub-Receta
                </button>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="flex items-center gap-1 text-[11px] font-bold bg-[#221F1D] text-[#F8F6F0] px-3 py-1 rounded-lg hover:bg-[#34302C]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>Añadir Ingrediente</span>
                </button>
              </div>
            </div>

            <div className="border border-[#E6DFD5] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F0] border-b border-[#E6DFD5] text-[#8C6239] font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5 pl-3 w-[40%]">Ingrediente</th>
                      <th className="p-2.5 w-[15%] text-center">Gramaje</th>
                      <th className="p-2.5 w-[12%] text-center">Unidad</th>
                      <th className="p-2.5 w-[15%] text-right">C/U ($)</th>
                      <th className="p-2.5 w-[14%] text-right">C/T ($)</th>
                      <th className="p-2.5 w-[4%] text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EFE9]">
                    {ingredients.map((ing, idx) => {
                      if (ing.isSubrecipeTitle) {
                        return (
                          <tr key={ing.id || idx} className="bg-[#FAF8F5]">
                            <td colSpan={5} className="p-2 pl-3">
                              <input
                                type="text"
                                value={ing.name}
                                onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                                placeholder="NOMBRE DE LA SUB-RECETA (Ej. SUB-RECETA GANACHE)"
                                className="w-full text-xs font-bold text-[#8C6239] bg-transparent focus:outline-none uppercase"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteIngredient(idx)}
                                className="text-[#A39E93] hover:text-[#C84B31] p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={ing.id || idx} className="hover:bg-[#FAF8F5]/60">
                          <td className="p-2 pl-3">
                            <input
                              type="text"
                              value={ing.name}
                              onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                              placeholder="Ej. QUESO CHIHUAHUA / HARINA"
                              className="w-full text-xs bg-transparent text-[#221F1D] focus:outline-none uppercase font-medium"
                              required
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="text"
                              value={ing.quantity !== undefined && ing.quantity !== null ? String(ing.quantity) : ''}
                              onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                              placeholder="Ej. 1/2 o 0.250"
                              className="w-24 text-center text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg px-1.5 py-1 text-[#221F1D] focus:outline-none focus:border-[#C59B27] font-medium"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <select
                              value={ing.unit}
                              onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                              className="text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg px-2 py-1 text-[#221F1D] focus:outline-none font-medium"
                            >
                              <option value="KG">KG</option>
                              <option value="LT">LT</option>
                              <option value="PZA">PZA</option>
                              <option value="TAZA">TAZA</option>
                              <option value="TBSP">TBSP</option>
                              <option value="TSP">TSP</option>
                              <option value="C/S">C/S</option>
                            </select>
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={ing.unitCost || ''}
                              onChange={(e) => handleIngredientChange(idx, 'unitCost', e.target.value)}
                              placeholder="0.00"
                              className="w-20 text-right text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-lg px-1.5 py-1 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-[#221F1D]">
                            ${Number(ing.totalCost || 0).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteIngredient(idx)}
                              className="text-[#A39E93] hover:text-[#C84B31] p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    <tr className="bg-[#FAF8F5] font-bold border-t-2 border-[#E6DFD5]">
                      <td colSpan={4} className="p-2.5 pl-3 text-right uppercase text-[11px] text-[#8C6239]">
                        Costo Total de Materia Prima:
                      </td>
                      <td className="p-2.5 text-right text-sm text-[#221F1D]">
                        ${totalCost.toFixed(2)} MXN
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Fila 3: Mise en Place */}
          <div className="space-y-2 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[11px] text-[#8C6239] uppercase tracking-wider">
                Mise en Place (Pasos Previos de Pesado y Cortes)
              </label>
              <button
                type="button"
                onClick={handleAddMise}
                className="text-[11px] font-semibold text-[#8C6239] hover:text-[#C59B27]"
              >
                + Añadir Paso
              </button>
            </div>
            <div className="space-y-2">
              {miseEnPlace.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-bold text-[#8C6239] text-xs w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleMiseChange(idx, e.target.value)}
                    placeholder="Ej. Tamizar juntos harina y bicarbonato de sodio..."
                    className="flex-1 text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-1.5 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteMise(idx)}
                    className="text-[#A39E93] hover:text-[#C84B31] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fila 4: Preparación */}
          <div className="space-y-2 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[11px] text-[#8C6239] uppercase tracking-wider">
                Preparación & Procedimiento (Horneo y Ensamble)
              </label>
              <button
                type="button"
                onClick={handleAddPrep}
                className="text-[11px] font-semibold text-[#8C6239] hover:text-[#C59B27]"
              >
                + Añadir Paso
              </button>
            </div>
            <div className="space-y-2">
              {preparation.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-bold text-[#8C6239] text-xs w-5">{idx + 1}.</span>
                  <textarea
                    rows={2}
                    value={step}
                    onChange={(e) => handlePrepChange(idx, e.target.value)}
                    placeholder="Ej. Batir mantequilla con azúcares por 4 minutos a velocidad media..."
                    className="flex-1 text-xs bg-[#FFFFFF] border border-[#E6DFD5] rounded-xl px-3 py-1.5 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePrep(idx)}
                    className="text-[#A39E93] hover:text-[#C84B31] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fila 5: Notas y Recomendaciones */}
          <div>
            <label className="block text-[11px] font-bold text-[#221F1D] uppercase mb-1">
              Notas Adicionales / Especificaciones
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Tiempo de vida en vitrina: 3 días. Temperatura de servicio: tibia."
              className="w-full text-xs bg-[#F8F6F0] border border-[#E6DFD5] rounded-xl px-3 py-2 text-[#221F1D] focus:outline-none focus:border-[#C59B27]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E6DFD5] shrink-0">
            {recipe && onDeleteRecipe ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Eliminar esta receta del catálogo?')) {
                    onDeleteRecipe(recipe.id);
                    onClose();
                  }
                }}
                className="text-xs text-[#C84B31] hover:underline font-semibold"
              >
                Eliminar Receta
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs px-4 py-2 text-[#6E665D] hover:text-[#221F1D]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-bold bg-[#221F1D] text-[#F8F6F0] px-6 py-2 rounded-xl hover:bg-[#34302C] shadow-xs disabled:opacity-50 disabled:cursor-wait"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Ficha'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

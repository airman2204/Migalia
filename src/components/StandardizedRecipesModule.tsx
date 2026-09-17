'use client'

import React, { useState } from 'react'
import { StandardRecipe, initialStandardRecipes } from '../lib/recipeTypes'
import RecipeForm from './RecipeForm'
import PrintableRecipe from './PrintableRecipe'
import { Plus, Download, Edit3, Trash2, BookOpen, Eye, Printer, FileText } from 'lucide-react'

export default function StandardizedRecipesModule() {
  const [recipes, setRecipes] = useState<StandardRecipe[]>(initialStandardRecipes)
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit' | 'preview'>('list')
  const [selectedRecipe, setSelectedRecipe] = useState<StandardRecipe | null>(initialStandardRecipes[0])

  // Guardar receta nueva o editada
  const handleSaveRecipe = (newRecipe: StandardRecipe) => {
    if (activeView === 'edit') {
      setRecipes(recipes.map((r) => (r.id === newRecipe.id ? newRecipe : r)))
    } else {
      setRecipes([newRecipe, ...recipes])
    }
    setSelectedRecipe(newRecipe)
    setActiveView('preview')
  }

  // Eliminar receta
  const handleDeleteRecipe = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta receta estandarizada?')) {
      const filtered = recipes.filter((r) => r.id !== id)
      setRecipes(filtered)
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(filtered[0] || null)
      }
    }
  }

  // Exportar PDF nativo e imprimible usando la ventana de impresión limpia
  const handleExportPDF = (recipe: StandardRecipe) => {
    const printContent = document.getElementById(`recipe-pdf-${recipe.id}`)
    if (!printContent) return

    const windowPrint = window.open('', '', 'width=900,height=1100')
    if (!windowPrint) return alert('Por favor habilita las ventanas emergentes para exportar el PDF.')

    windowPrint.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipe.recipeName} - Recetario Estandarizado</title>

          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 0px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: left; }
            th { background-color: #f3f3f3; color: #800000; text-transform: uppercase; }
            .header-subtitle { font-size: 13px; font-weight: bold; margin-bottom: 8px; }
            .section-title { font-weight: bold; color: #800000; margin-top: 6px; margin-bottom: 4px; text-transform: uppercase; }
            ol { margin: 0; padding-left: 18px; }
            li { margin-bottom: 2px; }
            .box { border: 1px solid #000; border-top: 0; padding: 8px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)

    windowPrint.document.close()
    windowPrint.focus()
    setTimeout(() => {
      windowPrint.print()
      windowPrint.close()
    }, 400)
  }

  return (
    <div className="space-y-6 select-none">
      {/* BARRA SUPERIOR DE ACCIONES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-3xl border border-[#E2D7CB] shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2B1D19] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#A07835]" />
            Modulo de Recetarios Estandarizados & Costeados
          </h2>
          <p className="text-xs text-[#7A6658]">
            Formatos institucionales listos para alta de fichas técnicas y exportación a PDF (Sin logo Migalia).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView !== 'list' && (
            <button
              onClick={() => setActiveView('list')}
              className="px-4 py-2 bg-[#F1EAE1] hover:bg-[#E2D7CB] text-[#2B1D19] text-xs font-semibold rounded-xl transition-colors"
            >
              Ver Catálogo de Recetas
            </button>
          )}

          <button
            onClick={() => {
              setSelectedRecipe(null)
              setActiveView('create')
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2B1D19] hover:bg-[#382820] text-[#FFFFFF] text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#A07835]" />
            <span>Alta de Receta</span>
          </button>
        </div>
      </div>

      {/* VISTA: FORMULARIO ALTA / EDICIÓN */}
      {(activeView === 'create' || activeView === 'edit') && (
        <RecipeForm
          initialData={activeView === 'edit' ? selectedRecipe : null}
          onSave={handleSaveRecipe}
          onCancel={() => setActiveView(recipes.length > 0 ? 'preview' : 'list')}
        />
      )}

      {/* VISTA: NAVEGADOR DE RECETAS + PREVISUALIZADOR PDF */}
      {(activeView === 'list' || activeView === 'preview') && selectedRecipe && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LISTA DE RECETAS A LA IZQUIERDA */}
          <div className="lg:col-span-4 bg-[#FFFFFF] p-4 rounded-3xl border border-[#E2D7CB] shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#2B1D19] px-2">Recetas Registradas ({recipes.length})</h3>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => {
                    setSelectedRecipe(recipe)
                    setActiveView('preview')
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    selectedRecipe?.id === recipe.id
                      ? 'bg-[#FAF6EF] border-[#A07835] shadow-sm'
                      : 'bg-[#FFFFFF] border-[#E2D7CB] hover:border-[#A07835]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#A07835]">
                      {recipe.presentation}
                    </span>
                    <h4 className="text-xs font-bold text-[#2B1D19] uppercase">{recipe.recipeName}</h4>
                    <span className="text-[10px] text-[#7A6658] block">
                      {recipe.yieldServings} • {recipe.ingredients.length} Ingredientes
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRecipe(recipe)
                        setActiveView('edit')
                      }}
                      className="p-1.5 text-[#7A6658] hover:text-[#2B1D19] hover:bg-[#F1EAE1] rounded-lg"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRecipe(recipe.id)
                      }}
                      className="p-1.5 text-[#7A6658] hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VISUALIZACIÓN Y EXPORTACIÓN PDF DE LA FICHA TÉCNICA A LA DERECHA */}
          <div className="lg:col-span-8 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2D7CB] shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2D7CB]">
              <div>
                <span className="text-xs font-semibold text-[#7A6658]">Previsualización del Formato PDF</span>
                <h3 className="font-serif font-bold text-lg text-[#2B1D19]">{selectedRecipe.recipeName}</h3>
              </div>

              <button
                onClick={() => handleExportPDF(selectedRecipe)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exportar a PDF</span>
              </button>
            </div>

            {/* VISTA FICHA INSTITUCIONAL EN PANTALLA */}
            <div className="overflow-x-auto p-4 bg-[#FAF6EF] rounded-2xl border border-[#E2D7CB]">
              <PrintableRecipe recipe={selectedRecipe} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

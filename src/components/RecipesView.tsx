'use client';

import React, { useState } from 'react';
import { Recipe } from '@/types';
import { ChefHat, Plus, Printer, Edit3, Trash2, Search, DollarSign, Sparkles, X } from 'lucide-react';
import { RecipePrintSheet } from './RecipePrintSheet';

interface RecipesViewProps {
  recipes: Recipe[];
  onOpenNewRecipe: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  onOpenNewRecipe,
  onSelectRecipe,
  onDeleteRecipe,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [printRecipe, setPrintRecipe] = useState<Recipe | null>(null);
  const [isPrintAllOpen, setIsPrintAllOpen] = useState(false);

  const categories = ['all', ...Array.from(new Set(recipes.map((r) => r.category || 'General')))];

  const filteredRecipes = recipes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || (r.category || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRecipeTotalCost = (r: Recipe) => {
    return r.ingredients
      .filter((i) => !i.isSubrecipeTitle)
      .reduce((sum, i) => sum + (Number(i.totalCost) || 0), 0);
  };

  const handlePrintSingle = (recipe: Recipe) => {
    setPrintRecipe(recipe);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handlePrintAll = () => {
    setIsPrintAllOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Contenido interactivo visible en pantalla, oculto en impresión */}
      <div className="space-y-6 print:hidden">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#221F1D] tracking-tight">
              Recetario & Fichas Técnicas
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#C59B27]/15 text-[#8C6239] rounded-md border border-[#C59B27]/30">
              Boutique Bakery
            </span>
          </div>
          <p className="text-xs text-[#6E665D] mt-1">
            Fichas técnicas con escandallo detallado, gramajes, costeos unitarios, mise en place y preparación.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {recipes.length > 0 && (
            <button
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-[#221F1D] border border-[#DDD5C7] hover:bg-[#F2EEE9] transition-all shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#8C6239]" />
              <span>Exportar Recetario Completo</span>
            </button>
          )}

          <button
            onClick={onOpenNewRecipe}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#221F1D] text-[#F8F6F0] hover:bg-[#34302C] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C59B27]" />
            <span>Nueva Ficha Técnica</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#E6DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#6E665D]">Total Fichas Técnicas</p>
            <p className="text-xl font-bold text-[#221F1D] mt-0.5">{recipes.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F8F6F0] flex items-center justify-center text-[#C59B27]">
            <ChefHat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E6DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#6E665D]">Costo Promedio / Receta</p>
            <p className="text-xl font-bold text-[#221F1D] mt-0.5">
              ${recipes.length > 0
                ? (recipes.reduce((sum, r) => sum + getRecipeTotalCost(r), 0) / recipes.length).toFixed(2)
                : '0.00'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F8F6F0] flex items-center justify-center text-[#8C6239]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#E6DFD5] shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A39E93] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre de receta o ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#F8F6F0] border border-[#DDD5C7] text-[#221F1D] focus:outline-hidden focus:ring-1 focus:ring-[#C59B27]"
          />
        </div>

        {categories.length > 2 && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#221F1D] text-[#F8F6F0]'
                    : 'bg-[#F8F6F0] text-[#6E665D] hover:bg-[#EBE7DF]'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Catalog Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#DDD5C7] p-12 text-center">
          <ChefHat className="w-10 h-10 text-[#C59B27] mx-auto mb-3 opacity-60" />
          <h3 className="text-xs font-bold text-[#221F1D]">No se encontraron recetas</h3>
          <p className="text-xs text-[#6E665D] mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No hay recetas que coincidan con la búsqueda actual.'
              : 'Empieza a registrar las recetas y escandallos para estandarizar la cocina de Migalia.'}
          </p>
          <button
            onClick={onOpenNewRecipe}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#221F1D] text-[#F8F6F0] hover:bg-[#34302C] transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#C59B27]" />
            <span>Crear Primera Ficha Técnica</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => {
            const cost = getRecipeTotalCost(recipe);
            const ingredientsCount = recipe.ingredients.filter((i) => !i.isSubrecipeTitle).length;
            const subrecipesCount = recipe.ingredients.filter((i) => i.isSubrecipeTitle).length;

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-xl border border-[#E6DFD5] p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#F8F6F0] text-[#8C6239] rounded-md border border-[#DDD5C7]">
                      {recipe.category || 'Repostería'}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#6E665D] block">Costo Total</span>
                      <span className="text-base font-bold text-[#221F1D]">
                        ${cost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectRecipe(recipe)}
                    className="text-sm font-bold text-[#221F1D] mt-3 group-hover:text-[#8C6239] cursor-pointer transition-colors"
                  >
                    {recipe.title}
                  </h3>

                  <div className="mt-3 space-y-1 text-xs text-[#6E665D]">
                    <div className="flex justify-between py-1 border-b border-[#F2EEE9]">
                      <span>Rendimiento:</span>
                      <span className="font-semibold text-[#221F1D] uppercase text-[11px]">
                        {recipe.yieldCount}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F2FEE9]">
                      <span>Presentación:</span>
                      <span className="font-semibold text-[#221F1D] uppercase text-[11px] truncate max-w-[170px]">
                        {recipe.presentation}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Insumos & Pasos:</span>
                      <span className="font-medium text-[#221F1D]">
                        {ingredientsCount} insumos {subrecipesCount > 0 ? ` (${subrecipesCount} subrecetas)` : ''} · {recipe.preparation.length} pasos
                      </span>
                    </div>
                  </div>
                </div>


                <div className="mt-5 pt-3 border-t border-[#F2EEE9] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePrintSingle(recipe)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#221F1D] bg-[#F8F6F0] hover:bg-[#EBE7DF] border border-[#DDD5C7] transition-all"
                    title="Imprimir / Guardar en PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#8C6239]" />
                    <span>PDF / Imprimir</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectRecipe(recipe)}
                      className="p-1.5 rounded-lg text-[#6E665D] hover:text-[#221F1D] hover:bg-[#F2EEE9] transition-all"
                      title="Editar ficha técnica"
                    >
                      <Edit3 className="w-4 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la ficha técnica "${recipe.title}"?`)) {
                          onDeleteRecipe(recipe.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#A39E93] hover:text-[#C84B31] hover:bg-[#FEE2E2]/40 transition-all"
                      title="Eliminar receta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Modal / Overlay para Impresión de Receta Individual */}
      {printRecipe && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center p-4 print:p-0 print:bg-white print:static print-only-container overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 print:p-0 print:border-none print:shadow-none shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E6DFD5] print:hidden">
              <div>
                <h3 className="text-sm font-bold text-[#221F1D]">
                  Vista Previa para Impresión / Exportación PDF
                </h3>
                <p className="text-xs text-[#6E665D]">
                  Ficha técnica estandarizada y costeada con logotipo oficial Migalia.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#221F1D] text-[#F8F6F0] hover:bg-[#34302C] transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={() => setPrintRecipe(null)}
                  className="p-2 rounded-xl text-[#6E665D] hover:bg-[#F2EEE9] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pb-4">
              <RecipePrintSheet recipe={printRecipe} />
            </div>
          </div>
        </div>
      )}

      {/* Modal / Overlay para Impresión del Recetario Completo */}
      {isPrintAllOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center p-4 print:p-0 print:bg-white print:static print-only-container overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 print:p-0 print:border-none print:shadow-none shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E6DFD5] print:hidden">
              <div>
                <h3 className="text-sm font-bold text-[#221F1D]">
                  Recetario Completo Migalia ({recipes.length} Recetas)
                </h3>
                <p className="text-xs text-[#6E665D]">
                  Se generará una página por receta lista para encuadernar o descargar en PDF.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#221F1D] text-[#F8F6F0] hover:bg-[#34302C] transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>Imprimir Todo</span>
                </button>
                <button
                  onClick={() => setIsPrintAllOpen(false)}
                  className="p-2 rounded-xl text-[#6E665D] hover:bg-[#F2EEE9] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-8 print:space-y-0">
              {recipes.map((r, idx) => (
                <div key={r.id} className="print:break-after-page">
                  <RecipePrintSheet recipe={r} />
                  {idx < recipes.length - 1 && (
                    <div className="my-6 border-b border-dashed border-[#DDD5C7] print:hidden" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

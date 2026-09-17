'use client'

import React from 'react'
import { StandardRecipe } from '../lib/recipeTypes'

interface PrintableRecipeProps {
  recipe: StandardRecipe
}

export default function PrintableRecipe({ recipe }: PrintableRecipeProps) {
  const totalCost = (recipe.ingredients || []).reduce((acc, curr) => acc + (curr.costTotal || 0), 0)

  return (
    <div
      id={`recipe-pdf-${recipe.id}`}
      className="bg-white text-black p-6 font-sans text-xs max-w-3xl mx-auto leading-normal border border-black shadow-none print:border-black"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* SUBTÍTULO SUPERIOR DE CABECERA */}
      <div className="font-bold text-sm mb-2 text-black flex justify-between items-center">
        <span>{recipe.headerSubTitle || 'Recetario estandarizado a 10 personas y costeado'}</span>
      </div>

      {/* TABLA CONTENEDORA PRINCIPAL Y ENCABEZADOS CON LOGO OFICIAL MIGALIA */}
      <table className="w-full border-collapse border border-black text-xs font-sans mb-0">
        <tbody>
          {/* ENCABEZADO LOGO MIGALIA Y DATOS */}
          <tr>
            {/* CELDA IZQUIERDA: LOGOMARCA OFICIAL MIGALIA Y DATOS FICHA */}
            <td className="w-2/3 border border-black p-3 align-top">
              <div className="flex items-center gap-3 mb-3 border-b border-gray-300 pb-2">
                {/* LOGO EXACTO DE MIGALIA CON SU ISOTIPO */}
                <div className="flex items-baseline font-serif tracking-[0.15em] text-2xl font-bold text-[#2B1D19]">
                  <span>M</span>
                  <span className="relative inline-flex flex-col items-center">
                    <span className="w-2 h-2 rounded-full bg-[#A07835] mb-0.5 shadow-sm"></span>
                    <span>I</span>
                  </span>
                  <span>GALIA</span>
                </div>
                <div className="text-[9px] uppercase font-sans font-bold text-[#7A6658] border-l border-gray-400 pl-2">
                  <div>Panadería & Café</div>
                  <div>Ficha Técnica de Producción</div>
                </div>
              </div>

              <div className="space-y-1 font-bold text-xs">
                <div className="flex">
                  <span className="w-28 font-bold">RECETA</span>
                  <span className="uppercase border-b border-black flex-1 pl-1">
                    {recipe.recipeName}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-bold">RENDIMIENTO</span>
                  <span className="uppercase border-b border-black flex-1 pl-1">
                    {recipe.yieldServings}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 font-bold">PRESENTACIÓN</span>
                  <span className="uppercase border-b border-black flex-1 pl-1">
                    {recipe.presentation}
                  </span>
                </div>
              </div>
            </td>

            {/* CELDA DERECHA: FOTO DEL PLATILLO / PRESENTACIÓN */}
            <td className="w-1/3 border border-black p-2 text-center align-middle bg-gray-50">
              {recipe.photoUrl ? (
                <img
                  src={recipe.photoUrl}
                  alt={recipe.recipeName}
                  className="max-h-28 mx-auto object-cover"
                />
              ) : (
                <div className="text-[10px] text-gray-400 italic">
                  [ Fotografía de Presentación MIGALIA ]
                </div>
              )}
            </td>
          </tr>

          {/* BARRA DE SEPARACIÓN */}
          <tr>
            <td colSpan={2} className="border border-black bg-gray-100 py-1 text-center font-bold text-[10px] text-[#2B1D19]">
              ♦ FICHA TÉCNICA ESTANDARIZADA DE PRODUCCIÓN - MIGALIA ♦
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABLA DE INGREDIENTES */}
      <table className="w-full border-collapse border border-black border-t-0 text-xs font-sans mb-0">
        <thead>
          <tr className="bg-gray-100 border-b border-black font-bold text-[#2B1D19]">
            <th className="border border-black p-1.5 text-left w-7/12 uppercase">
              INGREDIENTES
            </th>
            <th className="border border-black p-1.5 text-center w-2/12 uppercase">
              GRAMAJE
            </th>
            <th className="border border-black p-1.5 text-center w-1/12 uppercase">
              UNIDAD
            </th>
            <th className="border border-black p-1.5 text-right w-1/12 uppercase">
              C/U
            </th>
            <th className="border border-black p-1.5 text-right w-1/12 uppercase">
              C/T
            </th>
          </tr>
        </thead>
        <tbody>
          {recipe.ingredients.map((ing, index) => (
            <tr key={index} className="border-b border-black">
              <td className="border border-black p-1.5 font-semibold uppercase">
                {ing.name}
              </td>
              <td className="border border-black p-1.5 text-center font-mono">
                {ing.grammage.toFixed(3)}
              </td>
              <td className="border border-black p-1.5 text-center uppercase font-bold">
                {ing.unit}
              </td>
              <td className="border border-black p-1.5 text-right font-mono">
                {ing.costUnit ? `$${ing.costUnit.toFixed(2)}` : ''}
              </td>
              <td className="border border-black p-1.5 text-right font-mono font-bold">
                {ing.costTotal ? `$${ing.costTotal.toFixed(2)}` : ''}
              </td>
            </tr>
          ))}
          {totalCost > 0 && (
            <tr className="bg-gray-100 font-bold border-t-2 border-black">
              <td colSpan={4} className="border border-black p-1.5 text-right uppercase">
                COSTO TOTAL DIRECTO DE PRODUCCIÓN:
              </td>
              <td className="border border-black p-1.5 text-right font-mono text-sm text-[#A07835]">
                ${totalCost.toFixed(2)}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* SECCIÓN MISE EN PLACE */}
      <div className="border border-black border-t-0 p-3 bg-white">
        <div className="font-bold text-[#2B1D19] uppercase tracking-wider mb-1 text-xs">
          MISE EN PLACE:
        </div>
        <ol className="list-decimal list-inside space-y-0.5 text-xs">
          {recipe.miseEnPlace.map((step, i) => (
            <li key={i} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* SECCIÓN PREPARACIÓN */}
      <div className="border border-black border-t-0 p-3 bg-white">
        <div className="font-bold text-[#2B1D19] uppercase tracking-wider mb-1 text-xs">
          PREPARACIÓN
        </div>
        <ol className="list-decimal list-inside space-y-0.5 text-xs">
          {recipe.preparation.map((step, i) => (
            <li key={i} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

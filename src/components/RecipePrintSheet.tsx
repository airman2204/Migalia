'use client';

import React from 'react';
import { Recipe } from '@/types';

interface RecipePrintSheetProps {
  recipe: Recipe;
}

export const RecipePrintSheet: React.FC<RecipePrintSheetProps> = ({ recipe }) => {
  const totalCost = (recipe.ingredients || [])
    .filter((ing) => !ing.isSubrecipeTitle)
    .reduce((sum, ing) => sum + (Number(ing.totalCost) || 0), 0);

  return (
    <div className="bg-white text-black font-sans p-6 sm:p-8 max-w-[800px] mx-auto border border-black print:border-none print:p-0 print:m-0 print:max-w-none text-xs leading-tight">
      {/* Título Superior */}
      <div className="text-center font-bold text-sm sm:text-base tracking-wide mb-3 uppercase">
        {recipe.standardizedFor || 'Recetario estandarizado y costeado'}
      </div>

      {/* Caja Principal con Borde */}
      <div className="border border-black">
        {/* Encabezado: Logo + Metadatos de la Receta */}
        <div className="grid grid-cols-12 border-b border-black">
          {/* Logo Migalia */}
          <div className="col-span-4 p-3 flex flex-col justify-center items-center border-r border-black bg-white">
            <div className="flex items-baseline tracking-widest text-[#221F1D] select-none">
              <span className="text-2xl font-bold tracking-[0.25em]">M</span>
              <span className="text-2xl font-bold tracking-[0.25em] relative">
                I
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[#C59B27] rounded-sm transform rotate-12" />
              </span>
              <span className="text-2xl font-bold tracking-[0.25em]">GALIA</span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8C6239] font-bold mt-0.5">
              Boutique Bakery
            </span>
          </div>

          {/* Datos Receta, Rendimiento y Presentación */}
          <div className="col-span-8 divide-y divide-black">
            <div className="p-1.5 flex items-baseline gap-2">
              <span className="font-bold uppercase text-[11px] w-28 shrink-0">RECETA</span>
              <span className="font-bold text-[12px] uppercase tracking-wide truncate">{recipe.title}</span>
            </div>
            <div className="p-1.5 flex items-baseline gap-2">
              <span className="font-bold uppercase text-[11px] w-28 shrink-0">RENDIMIENTO</span>
              <span className="font-bold text-[11px] uppercase">{recipe.yieldCount}</span>
            </div>
            <div className="p-1.5 flex items-baseline gap-2">
              <span className="font-bold uppercase text-[11px] w-28 shrink-0">PRESENTACIÓN</span>
              <span className="font-bold text-[11px] uppercase">{recipe.presentation}</span>
            </div>
          </div>
        </div>

        {/* Tabla de Ingredientes y Escandallo */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black bg-gray-50 text-[10px] font-bold text-center">
              <th className="p-1.5 border-r border-black text-left pl-3 w-[45%] text-[#8C6239] uppercase">
                INGREDIENTES
              </th>
              <th className="p-1.5 border-r border-black w-[15%] text-[#8C6239] uppercase">
                GRAMAJE
              </th>
              <th className="p-1.5 border-r border-black w-[12%] text-[#8C6239] uppercase">
                UNIDAD
              </th>
              <th className="p-1.5 border-r border-black w-[14%] text-[#8C6239] uppercase">
                C/U
              </th>
              <th className="p-1.5 w-[14%] text-[#8C6239] uppercase">
                C/T
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/80 font-mono text-[11px]">
            {(recipe.ingredients || []).map((ing, idx) => {
              if (ing.isSubrecipeTitle) {
                return (
                  <tr key={ing.id || idx} className="bg-gray-100 font-bold font-sans">
                    <td colSpan={5} className="p-1.5 pl-3 border-r border-black uppercase text-[10px] tracking-wider text-[#8C6239]">
                      {ing.name}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={ing.id || idx} className="hover:bg-gray-50/50">
                  <td className="p-1 pl-3 border-r border-black font-sans font-medium uppercase text-[10.5px]">
                    {ing.name}
                  </td>
                  <td className="p-1 border-r border-black text-center font-mono">
                    {ing.quantity !== undefined && ing.quantity !== null && String(ing.quantity).trim() !== ''
                      ? typeof ing.quantity === 'number'
                        ? Number.isInteger(ing.quantity)
                          ? ing.quantity
                          : Number(ing.quantity).toFixed(3)
                        : ing.quantity
                      : '-'}
                  </td>
                  <td className="p-1 border-r border-black text-center font-sans">
                    {ing.unit}
                  </td>
                  <td className="p-1 border-r border-black text-right pr-2">
                    {ing.unitCost ? `$${Number(ing.unitCost).toFixed(2)}` : ''}
                  </td>
                  <td className="p-1 text-right pr-2 font-bold">
                    {ing.totalCost ? `$${Number(ing.totalCost).toFixed(2)}` : ''}
                  </td>
                </tr>
              );
            })}

            {/* Fila Total Costeo */}
            <tr className="border-t-2 border-black bg-gray-50 font-bold">
              <td colSpan={4} className="p-1.5 pl-3 border-r border-black text-right font-sans text-[11px] uppercase">
                COSTO TOTAL DE MATERIA PRIMA:
              </td>
              <td className="p-1.5 text-right pr-2 text-[12px] text-[#221F1D]">
                ${totalCost.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Sección Mise En Place */}
        <div className="border-t border-black p-2.5 space-y-1">
          <div className="font-bold text-[11px] uppercase tracking-wider text-[#8C6239]">
            MISE EN PLACE:
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px] pl-1">
            {(recipe.miseEnPlace || []).map((step, sIdx) => (
              <li key={sIdx} className="leading-snug">
                <span className="font-normal">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Sección Preparación */}
        <div className="border-t border-black p-2.5 space-y-1">
          <div className="font-bold text-[11px] uppercase tracking-wider text-[#8C6239]">
            PREPARACIÓN:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] pl-1">
            {(recipe.preparation || []).map((step, pIdx) => (
              <li key={pIdx} className="leading-relaxed">
                <span className="font-normal">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Notas Adicionales */}
        {recipe.notes && (
          <div className="border-t border-black p-2 bg-gray-50 text-[10px] italic text-gray-700">
            <strong>NOTAS / RECOMENDACIONES:</strong> {recipe.notes}
          </div>
        )}
      </div>

      {/* Pie de Página para Impresión */}
      <div className="mt-3 flex justify-between items-center text-[9px] text-gray-500 font-mono">
        <span>MÍGALIA BOUTIQUE BAKERY · DOCUMENTO DE CONTROL OPERATIVO</span>
        <span>IMPRESO: {new Date().toLocaleDateString('es-MX')}</span>
      </div>
    </div>
  );
};

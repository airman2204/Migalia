export interface StandardIngredient {
  id: string
  name: string
  grammage: number // Cantidad
  unit: string     // KG, LT, PZ, G, ML, etc.
  costUnit?: number // C/U (Opcional)
  costTotal?: number // C/T (Opcional)
}

export interface StandardRecipe {
  id: string
  recipeName: string
  yieldServings: string // ej. "10 PERSONAS" o "10 PERSONA"
  presentation: string  // ej. "ENTRADA CALIENTE", "POSTRE", "PANADERÍA"
  headerSubTitle?: string // ej. "Recetario estandarizado a 10 personas y costeado"
  institutionName?: string // ej. "Instituto Suizo de Gastronomía y Hostelería" (o configurable)
  ingredients: StandardIngredient[]
  miseEnPlace: string[]   // Pasos de Mise en Place
  preparation: string[]    // Pasos de Preparación
  photoUrl?: string       // Imagen opcional de la receta/platillo
  createdAt?: string
}

export const initialStandardRecipes: StandardRecipe[] = [
  {
    id: 'rec-1',
    recipeName: 'COSTRA DE QUESO',
    yieldServings: '10 PERSONA',
    presentation: 'ENTRADA CALIENTE',
    headerSubTitle: 'Recetario estandarizado a 10 personas y costeado',
    institutionName: 'Instituto Suizo de Gastronomía y Hotelería',
    ingredients: [
      { id: 'i1', name: 'QUESO CHIHUAHUA', grammage: 0.25, unit: 'KG', costUnit: 180, costTotal: 45 },
      { id: 'i2', name: 'QUESO PARMESANO', grammage: 0.25, unit: 'KG', costUnit: 320, costTotal: 80 },
      { id: 'i3', name: 'FILETE BLANCO DE NILO', grammage: 0.75, unit: 'KG', costUnit: 160, costTotal: 120 },
      { id: 'i4', name: 'PANKO', grammage: 0.3, unit: 'KG', costUnit: 90, costTotal: 27 },
      { id: 'i5', name: 'HUEVO', grammage: 0.1, unit: 'KG', costUnit: 45, costTotal: 4.5 },
      { id: 'i6', name: 'FRIJOLES REFRITOS', grammage: 0.2, unit: 'KG', costUnit: 35, costTotal: 7 },
      { id: 'i7', name: 'SAL', grammage: 0.005, unit: 'KG', costUnit: 15, costTotal: 0.08 },
      { id: 'i8', name: 'PIMIENTA', grammage: 0.005, unit: 'KG', costUnit: 220, costTotal: 1.1 },
      { id: 'i9', name: 'JITOMATE', grammage: 0.2, unit: 'KG', costUnit: 28, costTotal: 5.6 },
      { id: 'i10', name: 'CHILE SERRANO', grammage: 0.02, unit: 'KG', costUnit: 40, costTotal: 0.8 },
      { id: 'i11', name: 'CEBOLLA MORADA', grammage: 0.075, unit: 'KG', costUnit: 32, costTotal: 2.4 },
      { id: 'i12', name: 'ACEITE DE OLIVO', grammage: 0.1, unit: 'LT', costUnit: 190, costTotal: 19 },
      { id: 'i13', name: 'LIMÓN', grammage: 0.05, unit: 'KG', costUnit: 35, costTotal: 1.75 },
      { id: 'i14', name: 'HABANERO', grammage: 0.02, unit: 'KG', costUnit: 70, costTotal: 1.4 },
      { id: 'i15', name: 'CILANTRO', grammage: 0.02, unit: 'KG', costUnit: 40, costTotal: 0.8 },
      { id: 'i16', name: 'SUB-RECETA GUACAMOLE', grammage: 0.25, unit: 'KG', costUnit: 80, costTotal: 20 },
    ],
    miseEnPlace: [
      'Rallar queso chihuahua y parmesano',
      'Cortar el filete en dedos de pescado',
      'Saltear los frijoles',
      'Picar finamente chiles, cilantro y cebolla',
      'Cortar en jardinera el jitomate',
    ],
    preparation: [
      'Poner sobre la plancha el queso para hacer la costra',
      'Pasar por huevo y panco los dedos de pescado y freír',
      'Agregar frijoles a la costra de queso',
      'Envolver la costra con los dedos de pescado',
      'Mezclar los chiles, jitomate, cebolla y cilantro con aceite de oliva y jugo de limón',
      'Servir el pico de gallo con la costra de queso',
    ],
  },
]

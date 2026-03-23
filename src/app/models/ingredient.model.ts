// Interface for a specific measurement unit
export interface IngredientUnit {
  unit: string; // e.g., 'cup', 'tbsp', 'tsp', 'each'
  density_g_per_unit: number; // density in grams per unit (e.g., g/cup or g/tbsp)
}

// Interface defining the structure of an ingredient item and its density data
export interface Ingredient {
  key: string;
  name: string;
  units: IngredientUnit[];
}

// Interface to track user's input for an ingredient
export interface IngredientInput {
  key: string; // the key of the ingredient (e.g., 'flour_ap')
  volume: number | null; // the volume entered (e.g., 2.5)
  unit: string; // the selected unit (e.g., 'cup') (must match one from the Ingredient's units array)
}

// Interface for the final calculated result
export interface CalculatedResult {
  key: string;
  name: string;
  grams: number;
  percent: number;
  color: string;
}

// Dataset of standard baking ingredient densities (approximations)
export const DENSITY_DATA: Ingredient[] = [
  // { key: 'flour_ap', name: 'All-Purpose Flour', density_g_per_unit: 120, unit: 'cup' },
  // { key: 'flour_bread', name: 'Bread Flour', density_g_per_unit: 120, unit: 'cup' },
  // { key: 'flour_ww', name: 'Whole Wheat Flour', density_g_per_unit: 120, unit: 'cup' },
  // { key: 'sugar_granulated', name: 'Granulated Sugar', density_g_per_unit: 12.5, unit: 'tbsp' },
  // { key: 'sugar_powdered', name: 'Powdered Sugar', density_g_per_unit: 8, unit: 'tbsp' },
  // { key: 'salt_kosher', name: 'Salt (Kosher)', density_g_per_unit: 4, unit: 'tsp' },
  // { key: 'milk_powder', name: 'Dry Milk Powder', density_g_per_unit: 8, unit: 'tbsp' },

  // { key: 'baking_soda', name: 'Baking Soda', density_g_per_unit: 5, unit: 'tsp' },
  // { key: 'baking_powder', name: 'Baking Powder', density_g_per_unit: 5, unit: 'tsp' },

  // { key: 'water', name: 'Water', density_g_per_unit: 236, unit: 'cup' },
  // { key: 'milk', name: 'Milk', density_g_per_unit: 236, unit: 'cup' },
  // { key: 'butter', name: 'Butter (Solid)', density_g_per_unit: 227, unit: 'cup' },
  // { key: 'egg', name: 'Egg (Large)', density_g_per_unit: 50, unit: 'each' },

  {
    key: 'flour_ap',
    name: 'All-Purpose Flour',
    units: [
      { unit: 'cup', density_g_per_unit: 120 },
      { unit: 'tbsp', density_g_per_unit: 7.5 }, // 120g / 16 tbsp
    ],
  },
  {
    key: 'flour_bread',
    name: 'Bread Flour',
    units: [{ unit: 'cup', density_g_per_unit: 120 }],
  },
  {
    key: 'flour_ww',
    name: 'Whole Wheat Flour',
    units: [{ unit: 'cup', density_g_per_unit: 120 }],
  },
  {
    key: 'sugar_granulated',
    name: 'Granulated Sugar',
    units: [
      { unit: 'cup', density_g_per_unit: 200 },
      { unit: 'tbsp', density_g_per_unit: 12.5 }, // 200g / 16 tbsp
      { unit: 'tsp', density_g_per_unit: 4.17 }, // 12.5g / 3
    ],
  },
  {
    key: 'sugar_powdered',
    name: 'Powdered Sugar',
    units: [{ unit: 'tbsp', density_g_per_unit: 8 }],
  },
  {
    key: 'salt_kosher',
    name: 'Salt (Kosher)',
    units: [{ unit: 'tsp', density_g_per_unit: 4 }],
  },
  {
    key: 'milk_powder',
    name: 'Dry Milk Powder',
    units: [{ unit: 'tbsp', density_g_per_unit: 8 }],
  },
  {
    key: 'baking_soda',
    name: 'Baking Soda',
    units: [{ unit: 'tsp', density_g_per_unit: 5 }],
  },
  {
    key: 'baking_powder',
    name: 'Baking Powder',
    units: [{ unit: 'tsp', density_g_per_unit: 5 }],
  },
  {
    key: 'water',
    name: 'Water',
    units: [{ unit: 'cup', density_g_per_unit: 236 }],
  },
  {
    key: 'milk',
    name: 'Milk',
    units: [{ unit: 'cup', density_g_per_unit: 236 }],
  },
  {
    key: 'butter',
    name: 'Butter (Solid)',
    units: [{ unit: 'cup', density_g_per_unit: 227 }],
  },
  {
    key: 'egg',
    name: 'Egg (Large)',
    units: [{ unit: 'each', density_g_per_unit: 50 }],
  },
];

// Colors for pie chart visualization
export const PIE_CHART_COLORS = ['#6366f1', '#facc15', '#22c55e'];

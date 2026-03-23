import { Injectable, signal } from '@angular/core';
import {
  Ingredient,
  DENSITY_DATA,
  IngredientInput,
  IngredientUnit,
} from '../models/ingredient.model';

const initialRecipeState: IngredientInput[] = DENSITY_DATA.map((i) => ({
  key: i.key,
  volume: null,
  unit: i.units[0].unit, // defaults to the first unit defined for this ingredient (ie, 'cup' for flour)
}));

@Injectable({
  // *** this tells Angular to create a single instance of this service
  // and make it available across the entire application (a singleton)
  providedIn: 'root',
})
export class RecipeStateService {
  // holds full ingredient definitions (read-only)
  allIngredients = signal<Ingredient[]>(DENSITY_DATA);

  // dynamic state that tracks user's input
  recipeInputs = signal<IngredientInput[]>(initialRecipeState);

  constructor() {
    console.log('***** BakingService initialized *****');
    console.log('***** Recipe inputs state initialized *****');
  }
}

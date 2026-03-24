import { Injectable } from '@angular/core';
import { Recipe } from '../models/recipe.model';

export interface RecipeIndex {
  id: string;
  title: string;
  titleLower: string;
  ingredients: string[];
  ingredientsLower: string[];
  instructions: string[];
  instructionsLower: string[];
}

@Injectable({
  providedIn: 'root',
})
export class RecipeIndexService {
  private recipeIndex: RecipeIndex[] = [];

  constructor() {
    console.log('***** RecipeIndexService initialized *****');
  }

  /** Build search index for recipes*/
  buildIndex(recipes: Recipe[]): void {
    this.recipeIndex = recipes.map((recipe) => ({
      id: recipe.id || '',
      title: recipe.title,
      titleLower: recipe.title.toLowerCase(),
      ingredients: recipe.ingredients.map((ing) => ing.name),
      ingredientsLower: recipe.ingredients.map((ing) => ing.name.toLowerCase()),
      instructions: recipe.instructions.map((inst) => inst.step),
      instructionsLower: recipe.instructions.map((inst) => inst.step.toLowerCase()),
    }));

    console.log(`***** Indexed ${recipes.length} recipes *****`);
  }

  /** Search recipes using the index */
  search(query: string): string[] {
    if (!query.trim()) {
      return this.recipeIndex.map((index) => index.id);
    }

    const search = query.toLowerCase();
    return this.recipeIndex
      .filter((index) => this.matchesQuery(index, search))
      .map((index) => index.id);
  }

  /** Check if recipe index matches search query */
  private matchesQuery(index: RecipeIndex, search: string): boolean {
    return (
      index.titleLower.includes(search) ||
      index.ingredientsLower.some((ing) => ing.includes(search)) ||
      index.instructionsLower.some((inst) => inst.includes(search))
    );
  }

  getIndexedRecipes(): RecipeIndex[] {
    return this.recipeIndex;
  }

  clearIndex(): void {
    this.recipeIndex = [];
  }

  /** Get search suggestions based on title and ingredient matches */
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const search = query.toLowerCase();
    const suggestions = new Set<string>();
    
    // Add title matches
    this.recipeIndex
      .filter((index) => index.titleLower.includes(search))
      .forEach((index) => suggestions.add(index.title));
    
    // Add ingredient matches (prioritize ingredients over titles)
    this.recipeIndex.forEach((index) => {
      index.ingredientsLower.forEach(ing => {
        if (ing.includes(search)) {
          suggestions.add(ing); // Add the ingredient name, not recipe title
        }
      });
    });
    
    // Convert to array and limit
    return Array.from(suggestions).slice(0, limit);
  }

  /** Get popular terms from recipe titles */
  getPopularTerms(limit: number = 10): string[] {
    const termCounts = new Map<string, number>();

    this.recipeIndex.forEach((index) => {
      const words = index.titleLower
        .split(/\s+/)
        .filter((word) => word.length > 2);

      words.forEach((word) => {
        termCounts.set(word, (termCounts.get(word) || 0) + 1);
      });
    });

    return Array.from(termCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([term]) => term);
  }
}

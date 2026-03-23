import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RecipesList } from '../recipes-list/recipes-list';
import { Recipe } from '../models/recipe.model';
import { RecipeFirestoreService } from '../services/recipe-firestore.service';
import { RecipeIndexService } from '../services/recipe-index.service';
import { AuthService } from '../services/auth.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-index',
  standalone: true,
  templateUrl: './recipe-index.html',
  styleUrl: './recipe-index.css',
  imports: [CommonModule, RouterModule, MatIconModule, FormsModule, RecipesList],
})
export class RecipeIndex implements OnInit {
  recipes$?: Observable<Recipe[]>;
  mainRecipes: Recipe[] = [];
  archivedRecipes: Recipe[] = [];
  private destroy$ = new Subject<void>();
  currentUserId: string | null = null;
  selectedIngredient = '';
  ingredientSearchTerm = '';
  recipeSearchTerm = '';
  ingredientSuggestions: string[] = [];
  uniqueIngredients: string[] = [];
  filteredRecipes: Recipe[] = [];
  showIngredientSuggestions = false;
  selectedSuggestionIndex = -1;

  constructor(
    private recipeService: RecipeFirestoreService,
    private recipeIndexService: RecipeIndexService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authService.authState$.subscribe((user) => {
      this.currentUserId = user?.uid || null;
      this.loadRecipes();
    });
  }

  private loadRecipes(): void {
    if (!this.currentUserId) return;

    this.recipes$ = this.recipeService.getUserRecipes(this.currentUserId);
    this.recipes$.pipe(takeUntil(this.destroy$)).subscribe((recipes) => {
      // Separate main and archived recipes
      this.mainRecipes = recipes.filter((recipe) => !recipe.archived);
      this.archivedRecipes = recipes.filter((recipe) => recipe.archived === true || recipe.archived === undefined);
      
      // Extract unique ingredients for filtering
      this.extractUniqueIngredients();
      
      // Initialize filtered recipes
      this.filteredRecipes = [...this.mainRecipes];
    });
  }

  private extractUniqueIngredients(): void {
    const ingredients = new Set<string>();
    this.mainRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        ingredients.add(ing.name);
      });
    });
    this.uniqueIngredients = Array.from(ingredients).sort();
  }

  // Recipe search
  onRecipeSearchChange(searchTerm: string): void {
    this.applyCombinedFilters();
  }

  // Ingredient filtering with search suggestions
  onIngredientSearchChange(searchTerm: string): void {
    this.ingredientSearchTerm = searchTerm;
    
    if (searchTerm.length >= 2) {
      // Get suggestions from unique ingredients
      this.ingredientSuggestions = this.uniqueIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8);
      this.showIngredientSuggestions = true;
    } else {
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
    }
    
    // Apply combined filters
    this.applyCombinedFilters();
  }

  selectIngredientSuggestion(suggestion: string): void {
    this.ingredientSearchTerm = suggestion;
    this.selectedIngredient = suggestion;
    this.showIngredientSuggestions = false;
    this.selectedSuggestionIndex = -1;
    this.applyCombinedFilters();
  }

  // Combined filtering logic
  private applyCombinedFilters(): void {
    let filtered = [...this.mainRecipes];
    
    // Apply recipe title search
    if (this.recipeSearchTerm.trim()) {
      const search = this.recipeSearchTerm.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(search)
      );
    }
    
    // Apply ingredient filter
    if (this.ingredientSearchTerm.trim()) {
      filtered = filtered.filter(recipe => 
        recipe.ingredients.some(ing => 
          ing.name.toLowerCase().includes(this.ingredientSearchTerm.toLowerCase())
        )
      );
    }
    
    this.filteredRecipes = filtered;
  }

  // Keyboard navigation for suggestions
  onSuggestionKeydown(event: KeyboardEvent): void {
    if (!this.showIngredientSuggestions || this.ingredientSuggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(
          this.selectedSuggestionIndex + 1,
          this.ingredientSuggestions.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.max(
          this.selectedSuggestionIndex - 1,
          -1
        );
        break;
      case 'Enter':
      case 'Tab':
        event.preventDefault();
        if (this.selectedSuggestionIndex >= 0) {
          this.selectIngredientSuggestion(
            this.ingredientSuggestions[this.selectedSuggestionIndex]
          );
        }
        break;
      case 'Escape':
        this.showIngredientSuggestions = false;
        this.selectedSuggestionIndex = -1;
        break;
    }
  }

  private applyIngredientFilter(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredRecipes = [...this.mainRecipes];
    } else {
      this.filteredRecipes = this.mainRecipes.filter(recipe => 
        recipe.ingredients.some(ing => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }

  clearIngredientFilter(): void {
    this.ingredientSearchTerm = '';
    this.selectedIngredient = '';
    this.showIngredientSuggestions = false;
    this.applyCombinedFilters();
  }

  // Close suggestions when clicking outside
  onClickOutside(): void {
    this.showIngredientSuggestions = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

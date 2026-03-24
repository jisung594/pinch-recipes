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
  recipeSearchTerm = '';
  searchSuggestions: string[] = [];
  uniqueIngredients: string[] = [];
  filteredRecipes: Recipe[] = [];
  showSearchSuggestions = false;
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
      
      // Build search index for fast search and suggestions
      this.recipeIndexService.buildIndex(this.mainRecipes);
      
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

  // Unified search with suggestions
  onRecipeSearchChange(searchTerm: string): void {
    this.recipeSearchTerm = searchTerm;
    
    if (searchTerm.length >= 2) {
      // Get suggestions from search index service (includes titles, ingredients, instructions)
      this.searchSuggestions = this.recipeIndexService.getSuggestions(searchTerm, 8);
      this.showSearchSuggestions = true;
    } else {
      this.searchSuggestions = [];
      this.showSearchSuggestions = false;
    }
    
    // Apply search filtering
    this.applySearchFilter();
  }

  selectSuggestion(suggestion: string): void {
    this.recipeSearchTerm = suggestion;
    this.showSearchSuggestions = false;
    this.selectedSuggestionIndex = -1;
    this.applySearchFilter();
  }

  clearSearch(): void {
    this.recipeSearchTerm = '';
    this.showSearchSuggestions = false;
    this.selectedSuggestionIndex = -1;
    this.applySearchFilter();
  }

  // Search filtering logic (supports comma-separated multi-term search)
  private applySearchFilter(): void {
    if (!this.recipeSearchTerm.trim()) {
      this.filteredRecipes = [...this.mainRecipes];
      return;
    }

    const searchTerms = this.recipeSearchTerm
      .split(',')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);
    
    if (searchTerms.length === 0) {
      this.filteredRecipes = [...this.mainRecipes];
      return;
    }

    // Filter recipes that match ALL search terms
    this.filteredRecipes = this.mainRecipes.filter(recipe => 
      searchTerms.every(searchTerm => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ing => 
          ing.name.toLowerCase().includes(searchTerm)
        ) ||
        recipe.instructions.some(inst => 
          inst.step.toLowerCase().includes(searchTerm)
        )
      )
    );
  }

  // Keyboard navigation for suggestions
  onSuggestionKeydown(event: KeyboardEvent): void {
    if (!this.showSearchSuggestions || this.searchSuggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(
          this.selectedSuggestionIndex + 1,
          this.searchSuggestions.length - 1
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
          this.selectSuggestion(
            this.searchSuggestions[this.selectedSuggestionIndex]
          );
        }
        break;
      case 'Escape':
        this.showSearchSuggestions = false;
        this.selectedSuggestionIndex = -1;
        break;
    }
  }

  // Close suggestions when clicking outside
  onClickOutside(): void {
    this.showSearchSuggestions = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

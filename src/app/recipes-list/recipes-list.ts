import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../models/recipe.model';
import { RecipeFacadeService } from '../features/recipes/services/recipe.facade';
import { RecipeIndexService } from '../services/recipe-index.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  templateUrl: './recipes-list.html',
  styleUrl: './recipes-list.css',
  imports: [CommonModule, RouterModule, MatIconModule],
})
export class RecipesList implements OnInit, OnDestroy, OnChanges {
  @Input() searchTerm = '';
  @Input() recipes: Recipe[] = [];
  @Input() limit: number | null = null;

  private destroy$ = new Subject<void>();
  private allRecipes: Recipe[] = [];

  constructor(
    private recipeFacade: RecipeFacadeService,
    private recipeIndexService: RecipeIndexService,
  ) {}

  ngOnInit() {
    // Use provided recipes if available, otherwise fetch from Facade
    if (this.recipes.length > 0) {
      this.allRecipes = this.recipes;
      this.recipeIndexService.buildIndex(this.recipes);
    } else {
      // Subscribe to recipes from facade
      this.recipeFacade.recipes$.pipe(takeUntil(this.destroy$)).subscribe((recipes) => {
        this.allRecipes = recipes;
        this.recipeIndexService.buildIndex(recipes);
      });
      
      // Load recipes via facade
      this.recipeFacade.loadRecipes();
    }
  }


  get filteredRecipes(): Recipe[] {
    let recipes: Recipe[];
    
    if (!this.searchTerm.trim()) {
      recipes = this.allRecipes;
    } else {
      const matchingIds = this.recipeIndexService.search(this.searchTerm);
      recipes = this.allRecipes.filter((recipe) => matchingIds.includes(recipe.id || ''));
    }
    
    // Filter out archived recipes from main list
    recipes = recipes.filter(recipe => !recipe.archived);
    
    // Sort by most recent creation date when showing limited results
    if (this.limit && this.limit > 0) {
      recipes = recipes.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || a.createdAt?.getTime?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || b.createdAt?.getTime?.() || 0;
        return dateB - dateA; // Most recent first
      });
      return recipes.slice(0, this.limit);
    }
    
    return recipes;
  }

  ngOnChanges() {
    // Update recipes when input changes
    if (this.recipes.length > 0) {
      this.allRecipes = this.recipes;
      this.recipeIndexService.buildIndex(this.recipes);
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leak
    this.destroy$.next();
    this.destroy$.complete();
  }
}

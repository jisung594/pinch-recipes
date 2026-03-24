import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../models/recipe.model';
import { RecipeFirestoreService } from '../services/recipe-firestore.service';
import { RecipeIndexService } from '../services/recipe-index.service';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
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
  currentUserId: string | null = null;
  private allRecipes: Recipe[] = [];

  constructor(
    private firestoreService: RecipeFirestoreService,
    private recipeIndexService: RecipeIndexService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Use provided recipes if available, otherwise fetch from Firestore
    if (this.recipes.length > 0) {
      this.allRecipes = this.recipes;
      this.recipeIndexService.buildIndex(this.recipes);
    } else {
      this.authService.authState$.subscribe((user) => {
        this.currentUserId = user?.uid || null;
        this.loadRecipes();
      });
    }
  }

  private loadRecipes(): void {
    if (!this.currentUserId) return;

    this.firestoreService
      .getUserRecipes(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((recipes) => {
        this.allRecipes = recipes;
        this.recipeIndexService.buildIndex(recipes);
      });
  }

  get filteredRecipes(): Recipe[] {
    let recipes: Recipe[];
    
    if (!this.searchTerm.trim()) {
      recipes = this.allRecipes;
    } else {
      const matchingIds = this.recipeIndexService.search(this.searchTerm);
      recipes = this.allRecipes.filter((recipe) => matchingIds.includes(recipe.id || ''));
    }
    
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}

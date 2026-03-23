import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RecipesList } from '../recipes-list/recipes-list';
import { Recipe } from '../models/recipe.model';
import { RecipeFirestoreService } from '../services/recipe-firestore.service';
import { AuthService } from '../services/auth.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-index',
  standalone: true,
  templateUrl: './recipe-index.html',
  styleUrl: './recipe-index.css',
  imports: [CommonModule, RouterModule, MatIconModule, RecipesList],
})
export class RecipeIndex implements OnInit {
  recipes$?: Observable<Recipe[]>;
  mainRecipes: Recipe[] = [];
  archivedRecipes: Recipe[] = [];
  private destroy$ = new Subject<void>();
  currentUserId: string | null = null;

  constructor(
    private recipeService: RecipeFirestoreService,
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
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Recipe } from '../models/recipe.model';
import { RecipeFirestoreService } from '../services/recipe-firestore.service';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  templateUrl: './recipes-list.html',
  styleUrl: './recipes-list.css',
  imports: [CommonModule, RouterModule, MatIconModule]
})
export class RecipesList implements OnInit, OnDestroy {
  @Input() searchTerm = '';
  
  private destroy$ = new Subject<void>();
  currentUserId: string | null = null;
  private allRecipes: Recipe[] = [];

  constructor(
    private recipeService: RecipeFirestoreService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.authState$.subscribe(user => {
      this.currentUserId = user?.uid || null;
      this.loadRecipes();
    });
  }

  private loadRecipes(): void {
    if (!this.currentUserId) return;

    this.recipeService.getUserRecipes(this.currentUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(recipes => {
        this.allRecipes = recipes;
      });
  }

  get filteredRecipes(): Recipe[] {
    if (!this.searchTerm.trim()) {
      return this.allRecipes;
    }

    const search = this.searchTerm.toLowerCase();
    return this.allRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(search) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(search)) ||
      recipe.instructions.some(inst => inst.step.toLowerCase().includes(search))
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

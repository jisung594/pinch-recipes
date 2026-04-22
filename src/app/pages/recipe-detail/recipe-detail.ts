import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthFacadeService } from '../../features/auth/services/auth.facade';
import { RecipeFacadeService } from '../../features/recipes/services/recipe.facade';
import { RecipeEditor } from '../recipe-editor/recipe-editor';
import { IngredientRow } from '../recipe-editor/ingredients-form/ingredients-form.types';
import { InstructionRow } from '../recipe-editor/instructions-form/instructions-form.types';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RecipeEditor],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.css',
})
export class RecipeDetail implements OnDestroy {
  isAuthor = false;
  private authSub?: Subscription; // only accessed/relevant within this scope
  recipe: Recipe | null = null;
  recipeId: string | null = null;
  editedTitle?: string;
  editedYield?: { amount: number; unit: string };
  ingredientsRows: IngredientRow[] = [];
  instructionsRows: InstructionRow[] = [];
  isPublic = false;
  archived = false;
  editable = false;
  isDemoRecipe = false;
  demoRecipeId = 'dTGRZu6HOXFLz3ksCy8P';

  constructor(
    private route: ActivatedRoute,
    private authFacade: AuthFacadeService,
    private fb: FormBuilder,
    private recipeFacade: RecipeFacadeService,
  ) {}

  async ngOnInit() {
    this.isDemoRecipe = this.route.snapshot.data['isDemo'] ?? false;

    // Use hardcoded demo ID if on /demo route, otherwise read from URL
    this.recipeId = this.isDemoRecipe ? this.demoRecipeId : this.route.snapshot.paramMap.get('id');

    if (this.isDemoRecipe) {
      // Skip auth and load public recipe directly
      const snapshot = await this.recipeFacade.getPublicRecipeById(this.recipeId!);

      if (snapshot && snapshot.exists()) {
        this.isAuthor = true;
        this.recipe = snapshot.data();
        this.initRows();
      }

      return;
    }

    // Subscribes to auth state to get current user / data for given recipe id
    this.authSub = this.authFacade.authState$.subscribe(async (user) => {
      let snapshot;

      if (user) {
        // Load as recipe author first
        snapshot = await this.recipeFacade.getRecipeById(this.recipeId!);
        this.isAuthor = true;

        // Load as anonymous when user is not recipe author
        if (!snapshot.exists()) {
          snapshot = await this.recipeFacade.getPublicRecipeById(this.recipeId!);
        }
      } else {
        // Load as anonymmous (not logged in)
        snapshot = await this.recipeFacade.getPublicRecipeById(this.recipeId!);
      }

      if (snapshot && snapshot.exists()) {
        this.recipe = snapshot.data();

        this.initRows(this.recipe!);
      }
    });
  }

  private initRows(recipe: Recipe = this.recipe!) {
    this.ingredientsRows = recipe.ingredients.map((i) =>
      this.fb.group({
        name: this.fb.control(i.name, { nonNullable: true }),
        quantity: this.fb.control(i.quantity, { nonNullable: true }),
        unit: this.fb.control(i.unit, { nonNullable: true }),
        customUnit: this.fb.control(i.customUnit, { nonNullable: true }),
      }),
    );

    this.instructionsRows = recipe.instructions.map((i) =>
      this.fb.group({
        step: this.fb.control(i.step, { nonNullable: true }),
        order: this.fb.control(i.order, { nonNullable: true }),
        notes: this.fb.control(i.notes, { nonNullable: true }),
      }),
    );

    this.isPublic = recipe.isPublic;
    this.archived = recipe.archived;
  }

  ngOnDestroy() {
    // Clean up auth subscription to prevent memory leak
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}

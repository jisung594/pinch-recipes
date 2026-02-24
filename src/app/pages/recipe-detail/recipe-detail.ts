import { Component } from '@angular/core'
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RecipeFirestoreService } from '../../services/recipe-firestore.service';
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
export class RecipeDetail {
  private authSub?: Subscription; // only accessed/relevant within this scope
  recipe: Recipe | null = null;
  recipeId: string | null = null;
  editedTitle?: string;
  editedYield?: { amount: number; unit: string };
  ingredientsRows: IngredientRow[] = [];
  instructionsRows: InstructionRow[] = [];
  isPublic = false;
  archived = false;
  editable = false; // view mode by default

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private fb: FormBuilder,
    private recipeRepo: RecipeFirestoreService
  ) {}

  async ngOnInit() {
    // Subscribes to auth state to get current user / data for given recipe id
    this.authSub = this.authService.authState$.subscribe(async user => {
      if (!user) return;

      this.recipeId = this.route.snapshot.paramMap.get('id')!;
      const snapshot = await this.recipeRepo.getRecipeById(user.uid, this.recipeId);

      if (snapshot.exists()) {
        this.recipe = snapshot.data();
      }

      if (this.recipe) {
        // RecipeEditor (child) expects FormGroup arrays for ingredients / instructions
        // TODO: refactor RecipeEditor to accept plain arrays instead, to avoid this conversion
        this.ingredientsRows = this.recipe.ingredients.map(i =>
          this.fb.group({
            name: this.fb.control(i.name, { nonNullable: true }),
            quantity: this.fb.control(i.quantity, { nonNullable: true }),
            unit: this.fb.control(i.unit, { nonNullable: true }),
          })
        );

        this.instructionsRows = this.recipe.instructions.map(i =>
          this.fb.group({
            step: this.fb.control(i.step, { nonNullable: true }),
            order: this.fb.control(i.order, { nonNullable: true }),
          })
        );
        
        this.isPublic = this.recipe.isPublic;
        this.archived = this.recipe.archived;
      }
    });
  }
}

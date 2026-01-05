import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { IngredientsForm } from './ingredients-form/ingredients-form';
import { InstructionsForm } from './instructions-form/instructions-form';
import { AuthService } from '../../services/auth.service';
import { RecipeFirestoreService } from '../../services/recipe-firestore.service';
import { ToastService } from '../../services/toast.service';
import { mapIngredientRows, mapInstructionRows } from './recipe.utils';
import { IngredientRow } from './ingredients-form/ingredients-form.types';
import { InstructionRow } from './instructions-form/instructions-form.types';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-editor',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IngredientsForm, 
    InstructionsForm,
    MatIconModule
  ],
  templateUrl: './recipe-editor.html',
  styleUrl: './recipe-editor.css'
})
export class RecipeEditor {
  // using @Input, instead of local vars, for parent component RecipeDetail 
  // to pass in recipe data

  // Allows this component to be reused as form with CREATE, EDIT, and READ-ONLY modes
  @Input() recipeId: string | null = null;
  @Input() title: string = '';
  @Input() ingredients: IngredientRow[] = [];
  @Input() instructions: InstructionRow[] = [];
  @Input() editable: boolean = true; // defaults as form (enabled/disabled from parent RecipeDetail, when applicable)

  isEditingTitle = false;
  editingIngredients: boolean[] = []; 
  editingInstructions: boolean[] = [];
  currentRecipeId: string | null = null;

  constructor(
    private authService: AuthService,
    private firestoreService: RecipeFirestoreService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    // initializes editing state arrays to "false" for each row
    this.editingIngredients = this.ingredients.map(() => false);
    this.editingInstructions = this.instructions.map(() => false);
  }

  editTitle() {
    this.isEditingTitle = true;
  }

  saveTitle() {
    this.isEditingTitle = false;
  }

  // Runs when a IngredientsForm (child) emits an @Output
  onIngredientsChange(rows: IngredientRow[]) {
    this.ingredients = rows;
  }

  // Runs when a InstructionsForm (child) emits an @Output
  onInstructionsChange(rows: InstructionRow[]) {
    this.instructions = rows;
  }

  async archiveRecipe() {
    const recipeData: Partial<Recipe> = {
      title: this.title,
      ingredients: mapIngredientRows(this.ingredients),
      instructions: mapInstructionRows(this.instructions),
    }

    // TODO: confirmation dialog when "Archive" button is clicked


    // Toast notification upon archival
    this.toastService.notify(`${recipeData.title} has been archived.`, 10000);
  }

  async saveRecipe() {
    // Requires at least a valid recipe title upon submit
    if (!this.title) {
      console.warn("Recipe title is required before saving.");
      return;
    }

    const recipeData: Partial<Recipe> = {
      title: this.title,
      ingredients: mapIngredientRows(this.ingredients),
      instructions: mapInstructionRows(this.instructions),
    }
    const user = await this.authService.getCurrentUser();
    
    if (!user) {
      console.warn("You must be signed in to save recipes.");
      return;
    }

    try {
      // Updates firestore doc directly if recipe exists
      if (this.recipeId) {
        await this.firestoreService.updateRecipe(
          user.uid, 
          this.recipeId,
          recipeData
        );
        console.log('Recipe updated successfully.')
        return;
      } else {
        // Creates new recipe if none exists
        const newDocRef = await this.firestoreService.addRecipe(user.uid, {
          ...recipeData,
          title: recipeData.title!, // Non-null assertion (safe, since it's checked above)
          ingredients: recipeData.ingredients ?? [],
          instructions: recipeData.instructions ?? [],
          archived: recipeData.archived!,
          createdAt: new Date(),
        });

        this.currentRecipeId = newDocRef.id;
        this.router.navigate(['/recipes', this.currentRecipeId]);
        console.log('Recipe created successfully.');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
    }
  }
}

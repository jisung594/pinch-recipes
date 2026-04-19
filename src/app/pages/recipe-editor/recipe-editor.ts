import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { IngredientsForm } from './ingredients-form/ingredients-form';
import { InstructionsForm } from './instructions-form/instructions-form';
import { RecipeFacadeService } from '../../features/recipes/services/recipe.facade';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
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
    ReactiveFormsModule,
    IngredientsForm,
    InstructionsForm,
    MatIconModule,
    MatRippleModule,
    MatSlideToggleModule,
  ],
  templateUrl: './recipe-editor.html',
  styleUrl: './recipe-editor.css',
})
export class RecipeEditor implements OnInit, OnDestroy {
  @Input() isAuthor = false;
  @Input() recipeId: string | null = null;
  @Input() title: string = '';
  @Input() yield: { amount: number; unit: string } = { amount: 1, unit: 'unit' };
  @Input() ingredients: IngredientRow[] = [];
  @Input() instructions: InstructionRow[] = [];
  @Input() isPublic: boolean = false;
  @Input() archived: boolean = false;
  @Input() editable: boolean = false;
  @Input() isDemoRecipe: boolean = false;
  
  isDemo$!: Observable<boolean>;
  isDemoMode = false;
  private demoSub?: Subscription;

  recipeForm!: FormGroup;
  isEditingTitle = false;
  isEditingYield = false;
  isEditingIngredients = false;
  isEditingInstructions = false;
  currentRecipeId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private recipeFacade: RecipeFacadeService,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService,
  ) {
    // Combines demo account state (isDemoMode) and demo recipe flag (isDemoRecipe) to determine UI mode.
    // isDemoMode: from AuthService (demo account login)
    // isDemoRecipe: from @Input() (recipe at /demo route)
    // result => isDemoMode = true if either demo account OR demo recipe
    this.isDemo$ = combineLatest([
      this.authService.isDemoMode,
      new Observable<boolean>(observer => {
        observer.next(this.isDemoRecipe);
      })
    ]).pipe(
      map(([authDemo, inputDemo]) => authDemo || inputDemo)
    );
    
    // Subscribe to update the local property
    this.demoSub = this.isDemo$.subscribe(isDemo => {
      this.isDemoMode = isDemo;
    });
  }

  ngOnInit() {
    // Display edit mode, if new recipe
    if (this.recipeId === null) {
      this.isEditingTitle = true;
      this.isEditingYield = true;
      this.isEditingIngredients = true;
      this.isEditingInstructions = true;
    }

    this.recipeForm = this.fb.group({
      title: [this.title, Validators.required],
      yieldAmount: [this.yield.amount || 1, Validators.min(1)],
      yieldUnit: [this.yield.unit || 'unit'],
      ingredients: this.fb.array(this.ingredients),
      instructions: this.fb.array(this.instructions),
      isPublic: [this.isPublic || false],
    });
  }

  editTitle() {
    this.isEditingTitle = true;
  }

  editYield() {
    this.isEditingYield = true;
  }

  editIngredients() {
    this.isEditingIngredients = true;
  }

  editInstructions() {
    this.isEditingInstructions = true;
  }

  saveTitle() {
    this.isEditingTitle = false;
  }

  saveYield() {
    this.isEditingYield = false;
  }

  saveIngredients() {
    this.isEditingIngredients = false;
  }

  saveInstructions() {
    this.isEditingInstructions = false;
  }

  // Runs when a IngredientsForm (child) emits an @Output
  onIngredientsChange(rows: IngredientRow[]) {
    this.ingredients = rows;
  }

  // Runs when a InstructionsForm (child) emits an @Output
  onInstructionsChange(rows: InstructionRow[]) {
    this.instructions = rows;
  }

  togglePublic(event: any) {
    this.isPublic = event.checked;
  }

  async toggleArchive() {
    const recipeData: Partial<Recipe> = {
      title: this.title,
      ingredients: mapIngredientRows(this.ingredients),
      instructions: mapInstructionRows(this.instructions),
      archived: !this.archived,
    };

    const user = await this.authService.getCurrentUser();

    try {
      if (user && this.recipeId) {
        await this.recipeFacade.updateRecipe(this.recipeId!, recipeData);

        this.archived = !this.archived;

        this.logger.log(`Recipe ${recipeData.archived ? 'archived' : 'restored'} successfully.`);
      }
    } catch (err) {
      this.logger.error(`Error ${recipeData.archived ? 'archiving' : 'restoring'} recipe:`, err);
    }
  }

  async saveRecipe() {
    const formValue = this.recipeForm.value;

    const recipeData: Partial<Recipe> = {
      title: formValue.title,
      yield: {
        amount: formValue.yieldAmount || 1,
        unit: formValue.yieldUnit || 'unit',
      },
      ingredients: mapIngredientRows(this.ingredients),
      instructions: mapInstructionRows(this.instructions),
      isPublic: formValue.isPublic || false,
    };

    const user = await this.authService.getCurrentUser();

    if (!user) {
      // Facade will handle toast notification for auth error
      console.warn('Please create an account or login to save recipes.');
      return;
    }

    try {
      // Updates firestore doc directly if recipe exists
      if (this.recipeId) {
        await this.recipeFacade.updateRecipe(this.recipeId, recipeData);
        this.logger.log('Recipe updated successfully.');

        return;
      } else {
        // Creates new recipe if none exists
        const newRecipeId = await this.recipeFacade.saveRecipe({
          ...recipeData,
          title: recipeData.title!, // Non-null assertion (safe, since it's checked above)
          ingredients: recipeData.ingredients ?? [],
          instructions: recipeData.instructions ?? [],
          yield: recipeData.yield ?? { amount: 1, unit: 'unit' },
          isPublic: recipeData.isPublic ?? false,
          archived: false,
          createdAt: new Date(),
        });

        if (newRecipeId) {
          this.currentRecipeId = newRecipeId;
          this.router.navigate(['/recipes', newRecipeId]);
        } else {
          this.router.navigate(['/recipes']);
        }
        this.logger.log('Recipe created successfully.');
      }
    } catch (err) {
      this.logger.error('Error saving recipe:', err);
    }
  }

  async confirmDelete() {
    const recipeName = this.recipeForm.get('title')?.value;

    if (confirm(`Delete ${recipeName || 'this recipe'}? This cannot be undone.`)) {
      await this.deleteRecipe();
    }
  }

  async deleteRecipe() {
    if (!this.isAuthor || !this.recipeId) return;

    try {
      const user = await this.authService.getCurrentUser();

      if (user) {
        await this.recipeFacade.deleteRecipe(this.recipeId!);
        this.logger.log('Recipe deleted successfully.');
        this.router.navigate(['/profile']);
      }
    } catch (err) {
      this.logger.error('Delete failed:', err);
    }
  }

  ngOnDestroy() {
    // Clean up subscription and form to prevent memory leaks
    if (this.demoSub) {
      this.demoSub.unsubscribe();
    }
    if (this.recipeForm) {
      this.recipeForm.reset();
    }
  }
}

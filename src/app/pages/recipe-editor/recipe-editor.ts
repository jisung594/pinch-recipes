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
import { AuthFacadeService } from '../../features/auth/services/auth.facade';
import { AppFacadeService } from '../../features/app/services/app.facade';
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
  private syncingSub?: Subscription;

  recipeForm!: FormGroup;
  isEditingTitle = false;
  isEditingYield = false;
  isEditingIngredients = false;
  isEditingInstructions = false;
  currentRecipeId: string | null = null;

  // State observables from RecipeFacade
  isLoading$!: Observable<boolean>;
  isEditing$!: Observable<boolean>;
  isSyncing$!: Observable<boolean>;
  hasError$!: Observable<boolean>;
  status$!: Observable<any>;
  
  // Computed property for template usage
  isSyncing = false;

  constructor(
    private fb: FormBuilder,
    public recipeFacade: RecipeFacadeService,
    private authFacade: AuthFacadeService,
    private router: Router,
    private appFacade: AppFacadeService,
  ) {
    // Expose state observables for template use
    this.isLoading$ = this.recipeFacade.isLoading$;
    this.isEditing$ = this.recipeFacade.isEditing$;
    this.isSyncing$ = this.recipeFacade.isSyncing$;
    this.hasError$ = this.recipeFacade.hasError$;
    this.status$ = this.recipeFacade.status$;
    
    // Subscribe to isSyncing for template usage
    this.syncingSub = this.isSyncing$.subscribe(syncing => {
      this.isSyncing = syncing;
    });
    
    // Combines demo account state (isDemoMode) and demo recipe flag (isDemoRecipe) to determine UI mode.
    // isDemoMode: from AuthFacade (demo account login)
    // isDemoRecipe: from @Input() (recipe at /demo route)
    // result => isDemoMode = true if either demo account OR demo recipe
    this.isDemo$ = combineLatest([
      this.authFacade.isDemoMode$,
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
    const recipeData = {
      title: this.recipeForm.get('title')?.value || '',
      yield: this.recipeForm.get('yield')?.value || { amount: 1, unit: 'unit' },
      ingredients: mapIngredientRows(this.ingredients),
      instructions: mapInstructionRows(this.instructions),
      isPublic: this.isPublic,
      archived: !this.archived,
    };

    try {
      if (this.recipeId) {
        const action = recipeData.archived ? 'archived' : 'restored';
        const customMessage = `Recipe ${action}.`;
        
        await this.recipeFacade.updateRecipe(this.recipeId!, recipeData, customMessage);

        this.archived = !this.archived;

        this.appFacade.log(`Recipe ${action}.`);
      }
    } catch (err) {
      this.appFacade.logError(`Error ${recipeData.archived ? 'archiving' : 'restoring'} recipe:`, err);
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

    try {
      // Updates firestore doc directly if recipe exists
      if (this.recipeId) {
        await this.recipeFacade.updateRecipe(this.recipeId, recipeData);
        this.appFacade.log('Recipe updated successfully.');

        setTimeout(() => {
          if (this.isAuthor) {
            this.router.navigate(['/recipes', this.recipeId]);
          } else {
            this.router.navigate(['/recipes']);
          }
          this.appFacade.log('Recipe created successfully.');
        }, 1000);
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
        this.appFacade.log('Recipe created successfully.');
      }
    } catch (err) {
      this.appFacade.logError('Error saving recipe:', err);
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
      await this.recipeFacade.deleteRecipe(this.recipeId!);
      this.appFacade.log('Recipe deleted successfully.');
      this.router.navigate(['/profile']);
    } catch (err) {
      this.appFacade.logError('Delete failed:', err);
    }
  }

  // State banner helper methods
  getStateClasses(status: string): string {
    const classes = {
      'loading_data': 'bg-light-blue border border-med-blue',
      'editing': 'bg-orange/10 border border-orange/30',
      'syncing': 'bg-light-blue border border-med-blue',
      'success': 'bg-green-50 border border-green-200',
      'error': 'bg-red-50 border border-red-200',
      'confirm_discard': 'bg-orange/10 border border-orange/30',
      'abort': 'bg-lightest-gray border border-light-gray'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getIconClasses(status: string): string {
    const classes = {
      'loading_data': 'color-cta-blue',
      'editing': 'color-orange',
      'syncing': 'color-cta-blue',
      'success': 'color-cta-blue',
      'error': 'color-red',
      'confirm_discard': 'color-orange',
      'abort': 'color-dark-gray'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getTextClasses(status: string): string {
    const classes = {
      'loading_data': 'color-dark-gray',
      'editing': 'color-dark-gray',
      'syncing': 'color-dark-gray',
      'success': 'color-cta-blue',
      'error': 'color-red',
      'confirm_discard': 'color-dark-gray',
      'abort': 'color-dark-gray'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getStateIcon(status: string): string {
    const icons = {
      'loading_data': 'hourglass_empty',
      'editing': 'edit',
      'syncing': 'sync',
      'success': 'check_circle',
      'error': 'error',
      'confirm_discard': 'warning',
      'abort': 'cancel'
    };
    return icons[status as keyof typeof icons] || 'info';
  }

  getDefaultMessage(status: string): string {
    const messages = {
      'loading_data': 'Loading...',
      'editing': 'Editing...',
      'syncing': 'Saving...',
      'success': 'Success!',
      'error': 'An error occurred',
      'confirm_discard': 'You have unsaved changes',
      'abort': 'Operation cancelled'
    };
    return messages[status as keyof typeof messages] || '';
  }

  ngOnDestroy() {
    // Clean up subscription and form to prevent memory leaks
    if (this.demoSub) {
      this.demoSub.unsubscribe();
    }
    if (this.syncingSub) {
      this.syncingSub.unsubscribe();
    }
  }
}

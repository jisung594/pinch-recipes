import { 
  Component, 
  EventEmitter, 
  Input, 
  Output, 
  OnInit 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  FormsModule, 
  ReactiveFormsModule,
  Validators 
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
    ReactiveFormsModule,
    IngredientsForm, 
    InstructionsForm,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './recipe-editor.html',
  styleUrl: './recipe-editor.css'
})
export class RecipeEditor implements OnInit {
  @Input() recipeId: string | null = null;
  @Input() title: string = '';
  @Input() yield: { amount: number, unit: string } = { amount: 1, unit: 'unit' };
  @Input() ingredients: IngredientRow[] = [];
  @Input() instructions: InstructionRow[] = [];
  @Input() public: boolean = false;
  @Input() archived: boolean = false;
  @Input() editable: boolean = false; // defaults to view mode

  recipeForm!: FormGroup;
  isEditingTitle = false;
  isEditingYield = false;
  isEditingIngredients = false;
  isEditingInstructions = false;
  currentRecipeId: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestoreService: RecipeFirestoreService,
    private toastService: ToastService,
    private router: Router
  ) {}

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
      public: this.public
    });


    console.log("ngOnInit this.public", this.public)

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
    this.public = event.checked;  

    console.log("this.public", this.public);
  }

  async toggleArchive() {
    const recipeData: Partial<Recipe> = {
      title: this.title,
      ingredients: mapIngredientRows(this.ingredients),
      instructions: mapInstructionRows(this.instructions),
      archived: !this.archived,
    }

    const user = await this.authService.getCurrentUser();

    try {
      if (user && this.recipeId) {
        await this.firestoreService.updateRecipe(
          user.uid, 
          this.recipeId,
          recipeData
        );

        this.archived = !this.archived;

        console.log(`Recipe ${recipeData.archived ? 'archived' : 'restored'} successfully.`);

        // Toast notification upon change
        this.toastService.notify(
          `${recipeData.title || 'Recipe'} has been ${recipeData.archived ? 'archived' : 'restored'}.`
        );
      }
    } catch(err) {
      console.error(`Error ${recipeData.archived ? 'archiving' : 'restoring'} recipe:`, err);
    }

    // TODO: confirmation dialog when "RESTORE" button is clicked

  };

  async saveRecipe() {
    const formValue = this.recipeForm.value;

    console.log(formValue.public);

    const recipeData: Partial<Recipe> = {
      title: formValue.title,
      yield: {
        amount: formValue.yieldAmount || 1,
        unit: formValue.yieldUnit || 'unit'
      },
      ingredients: mapIngredientRows(this.ingredients),
      instructions: mapInstructionRows(this.instructions),
      public: formValue.public
    }

    const user = await this.authService.getCurrentUser();
    
    if (!user) {
      this.toastService.notify(
        'Please create an account or login to save recipes.'
      );

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

        // Toast notification upon update
        this.toastService.notify(
          `${recipeData.title || 'Recipe'} saved successfully.`
        );

        return;
      } else {
        // Creates new recipe if none exists
        const newDocRef = await this.firestoreService.addRecipe(user.uid, {
          ...recipeData,
          title: recipeData.title!, // Non-null assertion (safe, since it's checked above)
          ingredients: recipeData.ingredients ?? [],
          instructions: recipeData.instructions ?? [],
          yield: recipeData.yield ?? {amount: 1, unit: 'unit'},
          public: recipeData.public ?? false,
          archived: false,
          createdAt: new Date(),
        });

        this.currentRecipeId = newDocRef.id;
        this.router.navigate(['/recipes', this.currentRecipeId]);
        console.log('Recipe created successfully.');

        // Toast notification upon creation
        this.toastService.notify(
          `${recipeData.title || 'Recipe'} created successfully.`
        );
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
    }
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { 
  FormArray, 
  FormBuilder,
  FormGroup, 
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IngredientRow } from './ingredients-form.types';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-ingredients-form',
  standalone: true,
  templateUrl: './ingredients-form.html',
  styleUrl: './ingredients-form.css',
  imports: [CommonModule, ReactiveFormsModule]
})
export class IngredientsForm {
  @Input() initialIngredients: IngredientRow[] = [];
  @Input() editable = true;
  @Output() ingredientsChange = new EventEmitter<IngredientRow[]>();
  
  ingredientsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.ingredientsForm = this.fb.group({
      ingredients: this.fb.array([this.createIngredient()]),
    });
  }

  ngOnInit() {
    // Populates FormArray with initialIngredients input, if provided
    if (this.initialIngredients.length) {
      const ingredientsFormArray = this.ingredientsForm.get('ingredients') as FormArray<IngredientRow>;
      ingredientsFormArray.clear(); // Removes form controls unrelated to initialIngredients
      this.initialIngredients.forEach(row => ingredientsFormArray.push(row));
    }
  }

  // Returns typed reference to the FormArray
  get ingredients(): FormArray<IngredientRow> {
    return this.ingredientsForm.get('ingredients') as FormArray<IngredientRow>;
  }

  createIngredient(): IngredientRow {
    return this.fb.group({
      name: this.fb.control('', { nonNullable: true }),
      quantity: this.fb.control('', { nonNullable: true }),
      unit: this.fb.control('', { nonNullable: true }),
      isEditing: this.fb.control(true, { nonNullable: true }),
    });
  }

  addIngredient() {
    this.ingredients.push(this.createIngredient());
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);

    // Toast notification upon removal
    this.toastService.notifyUndoable("Ingredient removed.");
  }

  editIngredient(index: number) {
    const ingredient = this.ingredients.at(index);
    ingredient.patchValue({ isEditing: true });
  }

  saveIngredient(index: number) {
    const ingredient = this.ingredients.at(index);
    ingredient.patchValue({ isEditing: false });

    // Notifies parent
    this.emitChange();
  }

  emitChange() {
    this.ingredientsChange.emit(this.ingredients.controls as IngredientRow[]);
  }
}

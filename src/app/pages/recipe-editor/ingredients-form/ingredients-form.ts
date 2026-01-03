import { Component, EventEmitter, Input, Output } from '@angular/core';
import { 
  FormArray, 
  FormBuilder,
  FormGroup, 
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IngredientRow, IngredientValue } from './ingredients-form.types';
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

  createIngredient(removedItemValue?: Partial<IngredientValue>): IngredientRow {
    // Checks for removeItemValue to prefill fields upon undo
    if (removedItemValue !== undefined) {
      return this.fb.group({
        name: this.fb.control(removedItemValue.name ?? '', { nonNullable: true }),
        quantity: this.fb.control(removedItemValue.quantity ?? '', { nonNullable: true }),
        unit: this.fb.control(removedItemValue.unit ?? '', { nonNullable: true }),
        isEditing: this.fb.control(removedItemValue.isEditing ?? true, { nonNullable: true }),
      });
    }

    // Creates blank ingredient row (default)
    return this.fb.group({
      name: this.fb.control('', { nonNullable: true }),
      quantity: this.fb.control('', { nonNullable: true }),
      unit: this.fb.control('', { nonNullable: true }),
      isEditing: this.fb.control(true, { nonNullable: true }),
    });
  }

  addIngredient(removedItemIndex?: number, removedItemValue?: Partial<IngredientValue>) {
    if (removedItemIndex !== undefined) {
      return this.ingredients.insert(removedItemIndex, this.createIngredient(removedItemValue));
    }

    this.ingredients.push(this.createIngredient());
  }

  removeIngredient(index: number) {
    const removedItemValue = this.ingredients.at(index).value;

    this.ingredients.removeAt(index);

    // Toast notification upon removal
    this.toastService.notifyUndoable(
      `${removedItemValue.name} removed.`,
      () => reinsertIngredient() 
    );

    const reinsertIngredient = () => {
      // this.ingredients.push(this.createIngredient());
      this.addIngredient(index, removedItemValue);
    }
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

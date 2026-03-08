import { Component, EventEmitter, Input, Output } from '@angular/core';
import { 
  FormArray, 
  FormBuilder,
  FormGroup, 
  ReactiveFormsModule
} from '@angular/forms';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IngredientRow, IngredientValue } from './ingredients-form.types';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-ingredients-form',
  standalone: true,
  templateUrl: './ingredients-form.html',
  styleUrl: './ingredients-form.css',
  imports: [
    CdkDrag,
    CdkDropList,
    CommonModule, 
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ]
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
      });
    }

    // Creates blank ingredient row (default)
    return this.fb.group({
      name: this.fb.control('', { nonNullable: true }),
      quantity: this.fb.control('', { nonNullable: true }),
      unit: this.fb.control('', { nonNullable: true }),
    });
  }

  addIngredient(removedItemIndex?: number, removedItemValue?: Partial<IngredientValue>) {
    if (removedItemIndex !== undefined) {
      this.ingredients.insert(removedItemIndex, this.createIngredient(removedItemValue));
      
      // Notifies parent when an ingredient has been added back
      this.emitChange();
      return;
    }

    this.ingredients.push(this.createIngredient());

    // Notifies parent when an ingredient has been created
    this.emitChange();
  }

  removeIngredient(index: number) {
    const removedItemValue = this.ingredients.at(index).value;

    this.ingredients.removeAt(index);

    const reinsertIngredient = () => {
      this.addIngredient(index, removedItemValue);
    }

    // Toast notification upon removal
    this.toastService.notifyUndoable(
      `${removedItemValue.name || 'Ingredient'} removed.`,
      reinsertIngredient
    );

    // Notifies parent when ingredient has been removed or reinserted
    this.emitChange();
  }

  emitChange() {
    this.ingredientsChange.emit(this.ingredients.controls as IngredientRow[]);
  }
}

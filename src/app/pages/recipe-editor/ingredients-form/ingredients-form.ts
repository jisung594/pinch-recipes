import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { 
  FormArray, 
  FormBuilder,
  FormGroup, 
  ReactiveFormsModule
} from '@angular/forms';
import { 
  CdkDrag, 
  CdkDragDrop, 
  CdkDropList, 
  DragDropModule, 
  moveItemInArray 
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
    DragDropModule,
    CommonModule, 
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
  ]
})
export class IngredientsForm implements OnDestroy {
  @Input() initialIngredients: IngredientRow[] = [];
  @Input() editable = true;
  @Output() ingredientsChange = new EventEmitter<IngredientRow[]>();
  
  ingredientsForm: FormGroup;
  newIngredientIndex: number | null = null;
  private destroy$ = new Subject<void>();

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

  /**
   * Handles the drag-and-drop event for reordering ingredients. Triggered when a user 
   * drops a dragged item (ingredient form group) within the drop zone (cdkDropList), 
   * this function updates the form to reflect the new sequential order.
   */
  handleReorder(event: CdkDragDrop<FormGroup[]>) {
    // Built-in utility func to update form array order 
    moveItemInArray(
      this.ingredients.controls,
      event.previousIndex,
      event.currentIndex
    );

    this.emitChange();
  }

  // Returns typed reference to the FormArray
  get ingredients(): FormArray<IngredientRow> {
    return this.ingredientsForm.get('ingredients') as FormArray<IngredientRow>;
  }

  createIngredient(removedItemValue?: Partial<IngredientValue>): IngredientRow {
    const group = this.fb.group({
      name: this.fb.control(removedItemValue?.name ?? '', { nonNullable: true }),
      quantity: this.fb.control(removedItemValue?.quantity ?? '', { nonNullable: true }),
      unit: this.fb.control(removedItemValue?.unit ?? '', { nonNullable: true }),
      customUnit: this.fb.control(removedItemValue?.customUnit ?? '', { nonNullable: true }),
    });

    // Clear customUnit when unit changes to anything other than 'custom'
    group.get('unit')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(unitValue => {
        if (unitValue !== 'custom') {
          group.get('customUnit')?.setValue('', { emitEvent: false });
        }
      });

    // Also clear customUnit for initial state if unit is not 'custom'
    const currentUnit = group.get('unit')?.value;
    
    if (currentUnit && currentUnit !== 'custom') {
      group.get('customUnit')?.setValue('');
    }

    return group;
  }

  addIngredient(removedItemIndex?: number, removedItemValue?: Partial<IngredientValue>) {
    if (removedItemIndex !== undefined) {
      this.ingredients.insert(removedItemIndex, this.createIngredient(removedItemValue));
      
      // Notifies parent when an ingredient has been added back
      this.emitChange();
      return;
    }

    this.ingredients.push(this.createIngredient());

    // Set to auto-open details of new ingredient row
    this.newIngredientIndex = this.ingredients.length - 1;

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

  // Clean up subscriptions to prevent memory leaks
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

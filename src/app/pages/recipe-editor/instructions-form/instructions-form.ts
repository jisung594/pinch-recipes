import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { InstructionRow, InstructionValue } from './instructions-form.types';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-instructions-form',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    DragDropModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
  ],
  templateUrl: './instructions-form.html',
  styleUrl: './instructions-form.css',
})
export class InstructionsForm {
  @Input() initialInstructions: InstructionRow[] = [];
  @Input() editable = true;
  @Output() instructionsChange = new EventEmitter<InstructionRow[]>();

  instructionsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
  ) {
    this.instructionsForm = this.fb.group({
      instructions: this.fb.array([this.createInstruction(undefined, 0)]),
    });
  }

  ngOnInit() {
    // Populates FormArray with initialInstructions input, if provided
    if (this.initialInstructions.length) {
      const instructionsFormArray = this.instructionsForm.get(
        'instructions',
      ) as FormArray<InstructionRow>;
      instructionsFormArray.clear(); // Removes form controls unrelated to initialInstructions

      // Fix order values for old recipes that have order: 0 for all instructions
      this.initialInstructions.forEach((row, index) => {
        // Update the order value if it's 0 (indicating an old recipe)
        if (row.controls.order.value === 0) {
          row.controls.order.setValue(index);
        }
        instructionsFormArray.push(row);
      });
    }
  }

  /**
   * Handles the drag-and-drop event for reordering instructions. Triggered when a user
   * drops a dragged item (instruction form group) within the drop zone (cdkDropList),
   * this function updates the form to reflect the new sequential order.
   */
  handleReorder(event: CdkDragDrop<FormGroup[]>) {
    // Built-in utility func to update form array order
    moveItemInArray(this.instructions.controls, event.previousIndex, event.currentIndex);

    this.emitChange();
  }

  get instructions(): FormArray<InstructionRow> {
    return this.instructionsForm.get('instructions') as FormArray<InstructionRow>;
  }

  createInstruction(
    removedItemValue?: Partial<InstructionValue>,
    currentIndex?: number,
  ): InstructionRow {
    const group = this.fb.group({
      step: this.fb.control(removedItemValue?.step ?? '', { nonNullable: true }),
      order: this.fb.control(removedItemValue?.order ?? currentIndex ?? this.instructions.length, {
        nonNullable: true,
      }),
      notes: this.fb.control(removedItemValue?.notes ?? '', { nonNullable: true }),
    });

    return group;
  }

  addInstruction(removedItemIndex?: number, removedItemValue?: Partial<InstructionValue>) {
    if (removedItemIndex !== undefined) {
      this.instructions.insert(
        removedItemIndex,
        this.createInstruction(removedItemValue, removedItemIndex),
      );

      // Notifies parent when an instruction has been added back
      this.emitChange();
      return;
    }

    this.instructions.push(this.createInstruction(undefined, this.instructions.length));

    // Notifies parent when an instruction has been created
    this.emitChange();
  }

  removeInstruction(index: number) {
    const removedItemValue = this.instructions.at(index).value;

    this.instructions.removeAt(index);

    const reinsertInstruction = () => {
      this.addInstruction(index, removedItemValue);
    };

    // Toast notification upon removal
    this.toastService.notifyUndoable(
      `${removedItemValue.step || 'Step'} removed.`,
      reinsertInstruction,
    );

    // Notifies parent when instruction has been removed or reinserted
    this.emitChange();
  }

  // Emits change to instructions for RecipeForm (parent) to handle
  emitChange() {
    this.instructionsChange.emit(this.instructions.controls as InstructionRow[]);
  }
}

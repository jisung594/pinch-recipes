import { Component, EventEmitter, Input, Output } from '@angular/core';
import { 
  FormArray, 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InstructionRow, InstructionValue } from './instructions-form.types';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-instructions-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './instructions-form.html',
  styleUrl: './instructions-form.css'
})
export class InstructionsForm {
  @Input() initialInstructions: InstructionRow[] = [];
  @Input() editable = true;
  @Output() instructionsChange = new EventEmitter<InstructionRow[]>();

  instructionsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.instructionsForm = this.fb.group({
      instructions: this.fb.array([this.createInstruction()])
    })
  }

  ngOnInit() {
    // Populates FormArray with initialInstructions input, if provided
    if (this.initialInstructions.length) {
      const instructionsFormArray = this.instructionsForm.get('instructions') as FormArray<InstructionRow>;
      instructionsFormArray.clear(); // Removes form controls unrelated to initialInstructions
      this.initialInstructions.forEach(row => instructionsFormArray.push(row));
    }
  }

  get instructions(): FormArray<InstructionRow> {
    return this.instructionsForm.get('instructions') as FormArray<InstructionRow>;
  }

  createInstruction(removedItemValue?: Partial<InstructionValue>): InstructionRow {
    // Checks for removeItemValue to prefill fields upon undo
    if (removedItemValue !== undefined) {
      return this.fb.group({
        step: this.fb.control(removedItemValue.step ?? '', { nonNullable: true }),
        order: this.fb.control(removedItemValue.order ?? 0, { nonNullable: true }),
        notes: this.fb.control(removedItemValue.notes ?? '', { nonNullable: true }),
      });
    }

    // Creates blank instruction row (default)
    return this.fb.group({
      step: this.fb.control('', { nonNullable: true }),
      order: this.fb.control(0, { nonNullable: true }),
      notes: this.fb.control('', { nonNullable: true }),
    });
  }

  addInstruction(removedItemIndex?: number, removedItemValue?: Partial<InstructionValue>) {
    if (removedItemIndex !== undefined) {
      this.instructions.insert(removedItemIndex, this.createInstruction(removedItemValue));

      // Notifies parent when an instruction has been added back
      this.emitChange();
      return;
    }

    this.instructions.push(this.createInstruction());

    // Notifies parent when an instruction has been created
    this.emitChange();
  }

  removeInstruction(index: number) {
    const removedItemValue = this.instructions.at(index).value;

    this.instructions.removeAt(index);

    const reinsertInstruction = () => {
      this.addInstruction(index, removedItemValue);
    }

    // Toast notification upon removal
    this.toastService.notifyUndoable(
      `${removedItemValue.step || 'Step'} removed.`,
      reinsertInstruction
    );

    // Notifies parent when instruction has been removed or reinserted
    this.emitChange();
  }

  // Emits change to instructions for RecipeForm (parent) to handle
  emitChange() {
    this.instructionsChange.emit(this.instructions.controls as InstructionRow[]);
  }
}

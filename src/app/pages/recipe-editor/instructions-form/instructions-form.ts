import { Component, EventEmitter, Input, Output } from '@angular/core';
import { 
  FormArray, 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InstructionRow } from './instructions-form.types';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-instructions-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
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
      // instructions: this.fb.array([this.createInstruction(1)]) // starts first step in order at 1
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

  createInstruction(removedItemValue?: Partial<InstructionRow>): InstructionRow {

    // TODO: check for removedItemValue param and create accordingly

    return this.fb.group({
      step: this.fb.control('', { nonNullable: true }),
      // order: this.fb.control(order, { nonNullable: true }),
      order: this.fb.control(0, { nonNullable: true }), // previously 'order'
      isEditing: this.fb.control(true, { nonNullable: true }),
    });
  }

  addInstruction(removedItemIndex?: number, removedItemValue?: Partial<any>) {
    if (removedItemIndex !== undefined) {
      return this.instructions.insert(removedItemIndex, this.createInstruction(removedItemValue));
    }

    this.instructions.push(this.createInstruction());
  }

  removeInstruction(index: number) {
    const removedItemValue = this.instructions.at(index).value;

    this.instructions.removeAt(index);

    // Toast notification upon removal
    this.toastService.notifyUndoable(
      `${removedItemValue.step} removed.`,
      () => reinsertInstruction() 
    );

    const reinsertInstruction = () => {
      // this.instructions.push(this.createInstruction());
      this.addInstruction(index, removedItemValue);
    }
  }

  editInstruction(index: number) {
    const item = this.instructions.at(index);
    item.patchValue({ isEditing: true });
  }

  saveInstruction(index: number) {
    const instruction = this.instructions.at(index);
    instruction.patchValue({ isEditing: false });

    // Notifies parent
    this.emitChange();
  }

  // Emits change to instructions for RecipeForm (parent) to handle
  emitChange() {
    this.instructionsChange.emit(this.instructions.controls as InstructionRow[]);
  }
}

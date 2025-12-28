import { Component, EventEmitter, Input, Output } from '@angular/core';
import { 
  FormArray, 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecipeFirestoreService } from '../../../services/recipe-firestore.service';
import { InstructionRow } from './instructions-form.types';

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
    private fb: FormBuilder
  ) {
    this.instructionsForm = this.fb.group({
      instructions: this.fb.array([this.createInstruction(1)]) // starts first step in order at 1
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

  createInstruction(order: number): InstructionRow {
    return this.fb.group({
      step: this.fb.control('', { nonNullable: true }),
      order: this.fb.control(order, { nonNullable: true }),
      isEditing: this.fb.control(true, { nonNullable: true }),
    });
  }

  addInstruction(): void {
    const instructionsArray = this.instructions;
    const nextOrder = instructionsArray.length + 1;

    this.instructions.push(this.createInstruction(nextOrder));
  }

  removeInstruction(index: number) {
    this.instructions.removeAt(index);
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

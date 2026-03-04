import { Ingredient, Instruction } from '../../models/recipe.model';
import { IngredientRow } from './ingredients-form/ingredients-form.types';
import { InstructionRow } from './instructions-form/instructions-form.types';

// Transforms array of IngredientRow FormGroup's into Firestore-compatible Ingredient objects
export function mapIngredientRows(rows: IngredientRow[]): Ingredient[] {
  return rows.map((row) => ({
    name: row.controls.name.value,
    quantity: row.controls.quantity.value,
    unit: row.controls.unit.value,
  }));
}

// Transforms array of InstructionRow FormGroup's into Firestore-compatible Instruction objects
export function mapInstructionRows(rows: InstructionRow[]): Instruction[] {
  return rows.map((row) => ({
    step: row.controls.step.value,
    order: row.controls.order.value,
    notes: row.controls.notes.value,
  }));
}
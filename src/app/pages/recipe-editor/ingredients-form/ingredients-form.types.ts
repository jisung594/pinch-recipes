import { FormControl, FormGroup } from '@angular/forms';

export interface IngredientFormGroup {
  name: FormControl<string>;
  quantity: FormControl<string>;
  unit: FormControl<string>;
  isEditing: FormControl<boolean>;
}

// Each row is a FormGroup of above controls
export type IngredientRow = FormGroup<IngredientFormGroup>;

// Plain object value of an ingredient row
export interface IngredientValue {
  name: string;
  quantity: string;
  unit: string;
  isEditing: boolean;
}
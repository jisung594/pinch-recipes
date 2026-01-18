import { FormControl, FormGroup } from '@angular/forms';

export interface InstructionFormGroup {
  step: FormControl<string>;
  order: FormControl<number>;
}

export type InstructionRow = FormGroup<InstructionFormGroup>;

// Plain object value of an instruction row
export interface InstructionValue {
  step: string;
  order: number;
}
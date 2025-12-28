import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  showToastDelete(message: string, duration: number = 3000) {
    this.snackBar.open(message, 'Undo', {
      duration,
    });

		// TODO: Implement undo functionality
  }
}

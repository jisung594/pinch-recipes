import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  notify(message: string, duration: number = 5000) {
    this.snackBar.open(
			message, 
			"Dismiss",
			{ 
				duration,
				panelClass: ['snackbar-dismiss'], 
				horizontalPosition: 'right'
			}
		);
  }

	notifyUndoable(
		message: string, 
		onUndo: () => void, // the callback passed in when user clicks "Undo"
		duration: number = 5000
	) {
		// Setting a variable here allows for interacting with the opened snackbar
    const snackBarRef: MatSnackBarRef<any> = this.snackBar.open(
			message, 
			"Undo",
			{ 
				duration, 
				panelClass: ['snackbar-undo'], 
				horizontalPosition: 'right',
			}
		);

		snackBarRef.onAction().subscribe(() => {
			// Runs when the "Undo" button is clicked
			onUndo();
		})
  }
}

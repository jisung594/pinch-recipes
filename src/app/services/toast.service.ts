import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  notify(message: string, duration: number = 3000) {
    this.snackBar.open(
			message, 
			"Dismiss",
			{ 
				duration,
				horizontalPosition: 'right'
			});
  }

	notifyUndoable(message: string, duration: number = 10000) {
		// Setting a variable here allows for interacting with the opened snackbar
    const snackBarRef: MatSnackBarRef<any> = this.snackBar.open(
			message, 
			"Undo",
			{ 
				duration, 
				panelClass: ['snackbar-undo'], 
				horizontalPosition: 'right',
			});

		snackBarRef.onAction().subscribe(() => {
			console.log('UNDO clicked.');

			// Runs when the "Undo" button is clicked
			// TODO: callback logic for undo here
		})
  }


	// 1. undo func for removing single ingredient/instruction (SNACKBAR / toastService)
	// - store removed item temporarily
	// - restore item if "Undo" clicked within snackbar duration
	// - otherwise, finalize removal after duration expires
	// - ensure proper re-indexing of ingredient/instruction orders after undo
	// - show toast w/ confirmation of undo action


	// 2. archive func for removing entire recipe (CONFIRMATION DIALOG BOX / soft)
	// X create "archived" field in Recipe model
	// - filter out archived recipes from main recipe list view
	// - create separate "Archived Recipes" page to view/manage archived recipes
	// - allow un-archiving from that page
	

	// 3. hard delete func for permanently deleting archived recipe (CONFIRMATION DIALOG BOX / hard)



}

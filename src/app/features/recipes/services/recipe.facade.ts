import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe } from '../../../models/recipe.model';
import { RecipeFirestoreService } from '../../../services/recipe-firestore.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';

export interface RecipeStatus {
  status: 'idle' | 'loading_data' | 'editing' | 'syncing' | 'success' | 'error' | 'confirm_discard' | 'abort';
  message?: string;
}

export interface RecipeEditorState {
  isLoading: boolean;
  isEditing: boolean;
  isSyncing: boolean;
  hasError: boolean;
  isIdle: boolean;
  isNew: boolean;
  isDirty: boolean;
  canDiscard: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeFacadeService {
  private statusSubject = new BehaviorSubject<RecipeStatus>({ status: 'idle' });
  public status$ = this.statusSubject.asObservable();
  
  private currentRecipeSubject = new BehaviorSubject<Recipe | null>(null);
  public currentRecipe$ = this.currentRecipeSubject.asObservable();
  
  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  public recipes$ = this.recipesSubject.asObservable();
  
  // Granular state observables for template consumption
  public isLoading$ = this.statusSubject.pipe(
    map(status => status.status === 'loading_data')
  );
  
  public isEditing$ = this.statusSubject.pipe(
    map(status => status.status === 'editing')
  );
  
  public isSyncing$ = this.statusSubject.pipe(
    map(status => status.status === 'syncing')
  );
  
  public hasError$ = this.statusSubject.pipe(
    map(status => status.status === 'error')
  );
  
  public isIdle$ = this.statusSubject.pipe(
    map(status => status.status === 'idle')
  );
  
  public isNew$ = new BehaviorSubject<boolean>(false);
  public isDirty$ = new BehaviorSubject<boolean>(false);
  public canDiscard$ = this.isDirty$;

  constructor(
    private recipeFirestoreService: RecipeFirestoreService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}


  /**
   * Load recipes for the current user
   * @returns Promise<void> - Resolves when recipes are loaded
   */
  async loadRecipes(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Set status to syncing
      this.statusSubject.next({ status: 'syncing', message: 'Loading recipes...' });
      
      // Load recipes from Firestore
      this.recipeFirestoreService.getUserRecipes(user.uid).subscribe(recipes => {
        this.recipesSubject.next(recipes);
      });
      
      // Reset to idle
      this.statusSubject.next({ status: 'idle' });
      
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to load recipes.' 
      });
      console.error('Recipe load error:', error);
    }
  }

  /**
   * Set the current recipe for editing
   * @param recipe - The recipe to set as current
   */
  setCurrentRecipe(recipe: Recipe): void {
    this.currentRecipeSubject.next(recipe);
  }

  /**
   * Clear the current recipe
   */
  clearCurrentRecipe(): void {
    this.currentRecipeSubject.next(null);
  }

  /**
   * Get a recipe by ID for the current user
   * @param recipeId - The recipe ID to fetch
   * @returns Promise<DocumentSnapshot<Recipe>> - The recipe document snapshot
   */
  async getRecipeById(recipeId: string): Promise<any> {
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      return await this.recipeFirestoreService.getRecipeById(user.uid, recipeId);
    } catch (error) {
      console.error('Recipe fetch error:', error);
      throw error;
    }
  }

  /**
   * Get a public recipe by ID
   * @param recipeId - The recipe ID to fetch
   * @returns Promise<DocumentSnapshot<Recipe>> - The recipe document snapshot
   */
  async getPublicRecipeById(recipeId: string): Promise<any> {
    try {
      return await this.recipeFirestoreService.getPublicRecipeById(recipeId);
    } catch (error) {
      console.error('Public recipe fetch error:', error);
      throw error;
    }
  }

  /**
   * Save a recipe with status management and toast notifications
   * @param recipe - The recipe to save
   * @returns Promise<string | null> - The new recipe ID or null if save fails
   */
  async saveRecipe(recipe: Recipe): Promise<string | null> {
    try {
      // Set status to syncing
      this.statusSubject.next({ status: 'syncing', message: 'Saving recipe...' });

      // Call Firestore service to save
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      const docRef = await this.recipeFirestoreService.addRecipe(user.uid, recipe);

      // On success: set status to success
      this.statusSubject.next({ status: 'success', message: 'Recipe saved successfully!' });

      // Reset to idle after a delay
      setTimeout(() => {
        this.statusSubject.next({ status: 'idle' });
      }, 2000);

      // Return the new recipe ID
      return docRef.id;

    } catch (error) {
      // On error: set status to error and show error toast
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to save recipe. Please try again.' 
      });
      console.error('Recipe save error:', error);
      return null;
    }
  }

  /**
   * Update an existing recipe
   * @param recipeId - The ID of the recipe to update
   * @param recipe - The partial recipe data to update
   * @param customMessage - Optional custom success message
   * @returns Promise<void> - Resolves when update is complete
   */
  async updateRecipe(recipeId: string, recipe: Partial<Recipe>, customMessage?: string): Promise<void> {
    try {
      // Set status to syncing
      this.statusSubject.next({ status: 'syncing', message: 'Updating recipe...' });

      // Call Firestore service to update
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      await this.recipeFirestoreService.updateRecipe(user.uid, recipeId, recipe);

      // On success: set status to success
      this.statusSubject.next({ 
        status: 'success', 
        message: customMessage || 'Recipe updated successfully!' 
      });

      // Reset to idle after a delay
      setTimeout(() => {
        this.statusSubject.next({ status: 'idle' });
      }, 2000);

    } catch (error) {
      // On error: set status to error and show error toast
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to update recipe. Please try again.' 
      });
      console.error('Recipe update error:', error);
    }
  }

  /**
   * Delete a recipe
   * @param recipeId - The ID of the recipe to delete
   * @returns Promise<void> - Resolves when deletion is complete
   */
  async deleteRecipe(recipeId: string): Promise<void> {
    try {
      // Set status to syncing
      this.statusSubject.next({ status: 'syncing', message: 'Deleting recipe...' });

      // Call Firestore service to delete
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      await this.recipeFirestoreService.deleteRecipe(user.uid, recipeId);

      // On success: set status to success
      this.statusSubject.next({ status: 'success', message: 'Recipe deleted successfully!' });

      // Reset to idle after a delay
      setTimeout(() => {
        this.statusSubject.next({ status: 'idle' });
      }, 2000);

    } catch (error) {
      // On error: set status to error and show error toast
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to delete recipe. Please try again.' 
      });
      console.error('Recipe delete error:', error);
    }
  }

  // ===== STATE TRANSITION METHODS =====

  /**
   * Initialize recipe editor for new or existing recipe
   * @param recipeId - Optional recipe ID for existing recipes
   * @returns Promise<void> - Resolves when initialization is complete
   */
  async initRecipe(recipeId?: string): Promise<void> {
    try {
      if (recipeId) {
        // Loading existing recipe
        this.statusSubject.next({ status: 'loading_data', message: 'Loading recipe...' });
        this.isNew$.next(false);
        
        const user = await this.authService.getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        const snapshot = await this.getRecipeById(recipeId);
        if (snapshot && snapshot.exists()) {
          const recipe = snapshot.data();
          this.currentRecipeSubject.next(recipe);
          this.statusSubject.next({ status: 'idle' });
          this.isDirty$.next(false);
        } else {
          throw new Error('Recipe not found');
        }
      } else {
        // New recipe
        this.isNew$.next(true);
        this.currentRecipeSubject.next(null);
        this.statusSubject.next({ status: 'editing', message: 'Creating new recipe...' });
        this.isDirty$.next(true);
      }
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to load recipe.' 
      });
      console.error('Recipe initialization error:', error);
      throw error;
    }
  }

  /**
   * Enter editing mode (dirty state)
   * @returns void
   */
  editRecipe(): void {
    this.statusSubject.next({ status: 'editing', message: 'Editing recipe...' });
    this.isDirty$.next(true);
  }

  /**
   * Discard changes and return to idle state
   * @returns void
   */
  discardChanges(): void {
    this.statusSubject.next({ status: 'idle' });
    this.isDirty$.next(false);
    
    // If it was a new recipe, clear it
    if (this.isNew$.value) {
      this.currentRecipeSubject.next(null);
    }
  }

  /**
   * Show confirmation dialog for unsaved changes
   * @returns void
   */
  confirmDiscard(): void {
    this.statusSubject.next({ status: 'confirm_discard', message: 'You have unsaved changes.' });
  }

  /**
   * Cancel discard and return to editing
   * @returns void
   */
  cancelDiscard(): void {
    this.statusSubject.next({ status: 'editing', message: 'Continuing to edit...' });
  }

  /**
   * Handle navigation away from editor
   * @returns boolean - Returns true if navigation should proceed
   */
  async handleNavigationAway(): Promise<boolean> {
    if (this.isDirty$.value) {
      this.confirmDiscard();
      return false; // Navigation blocked until user confirms
    }
    return true; // Navigation allowed
  }

  /**
   * Abort current operation (for cleanup)
   * @returns void
   */
  abort(): void {
    this.statusSubject.next({ status: 'abort', message: 'Operation aborted.' });
    
    // Reset after a brief moment
    setTimeout(() => {
      this.statusSubject.next({ status: 'idle' });
      this.isDirty$.next(false);
    }, 100);
  }

  /**
   * Validate recipe before saving
   * @param recipe - Recipe to validate
   * @returns boolean - True if valid, false otherwise
   */
  private validateRecipe(recipe: Recipe): boolean {
    return !!(
      recipe.title?.trim() &&
      recipe.ingredients?.length > 0 &&
      recipe.instructions?.length > 0
    );
  }

  /**
   * Enhanced save with validation and state management
   * @param recipe - Recipe to save
   * @returns Promise<string | null> - Recipe ID or null if failed
   */
  async saveRecipeWithValidation(recipe: Recipe): Promise<string | null> {
    try {
      // Validate recipe first
      if (!this.validateRecipe(recipe)) {
        this.statusSubject.next({ status: 'error', message: 'Please fill in all required fields.' });
        return null;
      }

      // Set to syncing state
      this.statusSubject.next({ status: 'syncing', message: 'Saving recipe...' });

      let result: string | null;
      
      if (this.isNew$.value) {
        // Create new recipe
        result = await this.saveRecipe(recipe);
      } else {
        // Update existing recipe
        const recipeId = this.currentRecipeSubject.value?.id;
        if (!recipeId) {
          throw new Error('No recipe ID found for update');
        }
        await this.updateRecipe(recipeId, recipe);
        result = recipeId;
      }

      if (result) {
        this.isDirty$.next(false);
        this.isNew$.next(false);
      }

      return result;

    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to save recipe. Please try again.' 
      });
      console.error('Recipe save error:', error);
      return null;
    }
  }
}

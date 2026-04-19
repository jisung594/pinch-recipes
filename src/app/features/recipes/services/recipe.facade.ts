import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Recipe } from '../../../models/recipe.model';
import { RecipeFirestoreService } from '../../../services/recipe-firestore.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';

export interface RecipeStatus {
  status: 'idle' | 'syncing' | 'error' | 'success';
  message?: string;
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
      this.toastService.notify('Failed to load recipes.');
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

      // On success: set status to success and show success toast
      this.statusSubject.next({ status: 'success', message: 'Recipe saved successfully!' });
      this.toastService.notify('Recipe saved successfully!');

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
      this.toastService.notify('Failed to save recipe. Please try again.');
      console.error('Recipe save error:', error);
      return null;
    }
  }

  /**
   * Update an existing recipe
   * @param recipeId - The ID of the recipe to update
   * @param recipe - The partial recipe data to update
   * @returns Promise<void> - Resolves when update is complete
   */
  async updateRecipe(recipeId: string, recipe: Partial<Recipe>): Promise<void> {
    try {
      // Set status to syncing
      this.statusSubject.next({ status: 'syncing', message: 'Updating recipe...' });

      // Call Firestore service to update
      const user = await this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      await this.recipeFirestoreService.updateRecipe(user.uid, recipeId, recipe);

      // On success: set status to success and show success toast
      this.statusSubject.next({ status: 'success', message: 'Recipe updated successfully!' });
      this.toastService.notify('Recipe updated successfully!');

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
      this.toastService.notify('Failed to update recipe. Please try again.');
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

      // On success: set status to success and show success toast
      this.statusSubject.next({ status: 'success', message: 'Recipe deleted successfully!' });
      this.toastService.notify('Recipe deleted successfully!');

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
      this.toastService.notify('Failed to delete recipe. Please try again.');
      console.error('Recipe delete error:', error);
    }
  }
}

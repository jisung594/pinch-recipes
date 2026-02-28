import { Injectable } from '@angular/core';
import { 
    addDoc, 
    collection,
    collectionData,
    collectionGroup,
    CollectionReference,
    deleteDoc,
    doc,
    Firestore,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { recipeConverter, Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeFirestoreService {
  constructor(private firestore: Firestore) {}

  getUserRecipesRef(uid: string): CollectionReference<Recipe> {
    // Note: just a pointer (ref) to the collection
    return collection(this.firestore, `users/${uid}/recipes`).withConverter(recipeConverter);
  }

  getUserRecipes(uid: string): Observable<Recipe[]> {
    const recipesRef = this.getUserRecipesRef(uid);

    // Note: this was added to resolve "Expected type '_Query', but it was: a custom _CollectionReference object"
    // but it allows for chaining filters / orders later
    const recipesQuery = query(recipesRef);

    // Converts ref (or query) into Observable and listens for changes
    return collectionData(recipesQuery, { idField: 'id' }) as Observable<Recipe[]>;
  }
  
  addRecipe(uid: string, recipe: Recipe) {
    const recipesRef = this.getUserRecipesRef(uid);
    
    return addDoc(recipesRef, {
      ...recipe,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  updateRecipe(uid: string, recipeId: string, data: Partial<Recipe>) {
    const recipeDoc = doc(this.firestore, `users/${uid}/recipes/${recipeId}`).withConverter(recipeConverter);
    return updateDoc(recipeDoc, { 
        ...data, 
        updatedAt: serverTimestamp()
    });
  }

  deleteRecipe(uid: string, recipeId: string) {
    const recipeDoc = doc(this.firestore, `users/${uid}/recipes/${recipeId}`).withConverter(recipeConverter);
    return deleteDoc(recipeDoc);
  }

  async getRecipeById(uid: string, id: string) {
    const docRef = doc(this.firestore, `users/${uid}/recipes/${id}`).withConverter(recipeConverter);
    return await getDoc(docRef); // returns a DocumentSnapshot<Recipe>
  }

  async getPublicRecipeById(recipeId: string) {
    try {
      // Search across all 'recipe' collections where isPublic = true
      const recipesRef = collectionGroup(this.firestore, 'recipes');

      const q = query(
        recipesRef,
        where('isPublic', '==', true)
      ).withConverter(recipeConverter);

      const snapshot = await getDocs(q);
  
      // Find matching recipe
      const matchingDoc = snapshot.docs.find(doc => doc.id === recipeId);
      return matchingDoc || null;
    } catch (err) {
      console.error("ERROR:", err);
      return null;
    }
  }
}
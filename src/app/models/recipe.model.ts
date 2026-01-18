import { 
  FirestoreDataConverter, 
  DocumentData 
} from '@angular/fire/firestore';

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Instruction {
  step: string;
  order: number;
}

// recipe document structure (saved to Firestore)
export interface Recipe {
  id?: string; // Firestore auto-generated ID
  title: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  archived: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface User {
  id?: string; // Firestore auto-generated ID
}

// Firestore converter
export const recipeConverter: FirestoreDataConverter<Recipe> = {
  toFirestore(recipe: Recipe): DocumentData {
    return { ...recipe };
  },
  fromFirestore(snapshot, options): Recipe {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      title: data['title'],
      ingredients: data['ingredients'],
      instructions: data['instructions'],
      archived: data['archived'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    };
  }
};
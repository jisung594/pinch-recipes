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
  notes: string;
}

// recipe document structure (saved to Firestore)
export interface Recipe {
  id?: string; // Firestore auto-generated ID
  title: string;
  yield: {
    amount: number,
    unit: string
  };
  ingredients: Ingredient[];
  instructions: Instruction[];
  isPublic: boolean;
  archived: boolean;
  createdAt?: any;
  updatedAt?: any;
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
      yield: data['yield'] || { amount: 1, unit: '' },
      ingredients: data['ingredients'],
      instructions: data['instructions'],
      isPublic: data['isPublic'],
      archived: data['archived'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    };
  }
};
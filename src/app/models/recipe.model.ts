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
  yield: {
    amount: number,
    unit: string
  };
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
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
      yield: {
        amount: data['yield']['amount'],
        unit: data['yield']['unit']
      },
      ingredients: data['ingredients'],
      instructions: data['instructions'],
      tags: data['tags'],
      archived: data['archived'],
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    };
  }
};
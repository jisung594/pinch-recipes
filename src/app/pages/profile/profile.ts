import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Recipe } from '../../models/recipe.model';
import { AuthService } from '../../services/auth.service';
import { RecipeFirestoreService } from '../../services/recipe-firestore.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports:[CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  // $ (syntax for observable)
  // ! (not initialized in constructor, but
  //   promises to assign value before accessed)
  recipes$!: Observable<Recipe[]>;
  mainRecipes: Recipe[] = [];
  archivedRecipes: Recipe[] = [];

  constructor(
    private authService: AuthService,
    private firestoreService: RecipeFirestoreService
  ) {}

  // Called after input properties are set, but before DOM is ready
  async ngOnInit() {
    // Reacts to changes to user state
    this.authService.authState$.subscribe(user => {
      if (user) {
        this.recipes$ = this.firestoreService.getUserRecipes(user.uid);

        this.recipes$.subscribe(recipes => {
          this.mainRecipes = recipes.filter((recipe) => {
            return recipe.archived === false;
          })
          this.archivedRecipes = recipes.filter((recipe) => {
            return recipe.archived === true || recipe.archived === undefined;
          })
        });

      } else {
        console.warn("No user logged in");
      }
    });
  }
}

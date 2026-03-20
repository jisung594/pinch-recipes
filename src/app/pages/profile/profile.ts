import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'firebase/auth';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { Recipe } from '../../models/recipe.model';
import { AuthService } from '../../services/auth.service';
import { RecipeFirestoreService } from '../../services/recipe-firestore.service';
import { ToastService } from '../../services/toast.service';
import { ProfileForm } from '../profile/profile-form/profile-form';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports:[
    CommonModule, 
    RouterModule, 
    MatIconModule, 
    ProfileForm
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  // $ (syntax for observable)
  // ! (not initialized in constructor, but
  //   promises to assign value before accessed)
  isEditingProfile = false;
  editedProfileData?: UserProfile;
  private currentUser?: User | null;
  recipes$!: Observable<Recipe[]>;
  userProfile$!: Observable<UserProfile | null>;
  mainRecipes: Recipe[] = [];
  archivedRecipes: Recipe[] = [];
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private firestoreService: RecipeFirestoreService,
    private toastService: ToastService,
  ) {}

  async ngOnInit() {
    const sub = this.authService.authState$.pipe(
      switchMap(user => {
        this.currentUser = user;

        if (!user) {
          return of([]);
        }

        return this.firestoreService.getUserRecipes(user.uid);
      })
    ).subscribe(recipes => {
      this.mainRecipes = recipes.filter(recipe => recipe.archived === false);
      this.archivedRecipes = recipes.filter(recipe => recipe.archived === true || recipe.archived === undefined);
    });

    this.subscriptions.add(sub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onProfileChange(profileData: UserProfile) {
    this.editedProfileData = profileData;
  }

  editProfile() {
    this.isEditingProfile = true;
  }

  async saveProfile() {
    this.isEditingProfile = false;

    try {
      if (this.currentUser && this.editedProfileData) {
        await this.authService.updateProfile(this.currentUser.uid, this.editedProfileData);
        this.isEditingProfile = false;
      }

      // Toast notification upon update
      this.toastService.notify('Profile updated successfully.');
    } catch(err) {
      console.error('Error updating profile:', err);
    }
  }
}

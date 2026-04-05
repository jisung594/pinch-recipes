import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { User } from 'firebase/auth';
import { Observable, Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ProfileForm } from '../profile/profile-form/profile-form';
import { UserProfile } from '../../models/user-profile.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ProfileForm],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  isEditingProfile = false;
  editedProfileData?: UserProfile;
  isDemo$!: Observable<boolean>;
  userProfile$!: Observable<UserProfile | null>;
  private currentUser?: User | null;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
  ) {
    this.isDemo$ = this.authService.isDemoMode;
  }

  async ngOnInit() {
    this.authService.authState$.subscribe((user) => {
      this.currentUser = user;
    });
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

      this.toastService.notify('Profile updated successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  }
}

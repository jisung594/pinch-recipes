import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup, 
  ReactiveFormsModule
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserProfile } from '../../../models/user-profile.model';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileForm implements OnInit {
  isEditingProfile = false;
  userProfile$!: Observable<UserProfile | null>;
  profileForm: FormGroup;
  private subscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      displayName: [''],
      firstName: [''],
      lastName: ['']
    })
  }

  ngOnInit() {
    this.userProfile$ = this.authService.userProfile$;

    // Populate form with current profile data
    this.subscription = this.userProfile$.subscribe(profile => {
      if (profile) {
        this.profileForm.patchValue(profile);
      }
    });
  }

  editProfile() {
    this.isEditingProfile = true;
  }

  saveProfile() {
    this.isEditingProfile = false;

    // TODO: set save func in authService and call here
  }


}

import { CommonModule } from '@angular/common';
import { 
  Component, 
  EventEmitter, 
  Input, 
  Output, 
  OnInit, 
  OnDestroy 
} from '@angular/core';
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
export class ProfileForm implements OnInit, OnDestroy {
  @Input() isEditingProfile: boolean = false;
  @Output() profileChange = new EventEmitter<UserProfile>();

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

    // Emits whenever form changes
    this.profileForm.valueChanges.subscribe(value => {
      this.profileChange.emit(value);
    });
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

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

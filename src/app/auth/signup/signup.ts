import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { FirebaseError } from '@firebase/util';
import { AuthFacadeService } from '../../features/auth/services/auth.facade';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  errorCode: string = '';
  user: User | null = null;
  signupForm: FormGroup;

  constructor(
    private authFacade: AuthFacadeService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.signupForm = this.fb.group({
      firstName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      lastName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      displayName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      email: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'),
        ],
      }),
      password: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
          ),
        ],
      }),
    });
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  async handleSignUp() {
    try {
      const { firstName, lastName, displayName, email, password } = this.signupForm.value;
      await this.authFacade.signUp(firstName, lastName, displayName, email, password);
      this.router.navigate(['/']);
      // Facade handles toast notification
    } catch (err) {
      if (err instanceof FirebaseError) {
        this.errorCode = err.code;
      }
      console.log('Sign-up error:', err);
    }
  }

  async handleGoogleSignIn() {
    try {
      await this.authFacade.signInWithGoogle();
      this.router.navigate(['/']);
      // Facade handles toast notification
    } catch (err) {
      console.log('Login error:', err);
    }
  }
}

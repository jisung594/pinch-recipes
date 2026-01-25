import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup, 
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule, 
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
    MatMenu, 
    MatMenuTrigger
  ],
  standalone: true,
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  user: User | null = null;

  signupForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    });
  }

  async handleSignUp() {
    try {
      const { email, password } = this.signupForm.value;
      await this.authService.signUp(email, password);
      // this.router.navigate(['/']);
    } catch (err) {
      // window.alert('Invalid credentials - please try again.'); // placeholder
      console.log("Sign-up error:", err);
    }
  }
 
  async handleGoogleSignIn() {
    try {
      const userCreds = await this.authService.signInWithGoogle();
      console.log("Logged in as", userCreds.user);
    } catch (err) {
      console.log("Login error:", err);
    }
  }
}

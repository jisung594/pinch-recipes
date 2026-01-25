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
  selector: 'app-login',
  imports: [
    CommonModule, 
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
    MatMenu, 
    MatMenuTrigger
  ],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  user: User | null = null;

  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    });
  }

  async handleSignIn() {
    try {
      const { email, password } = this.loginForm.value;
      await this.authService.signIn(email, password);
      this.router.navigate(['/profile']);
    } catch (err) {
      window.alert('Invalid credentials - please try again.'); // placeholder
      console.log("Login error:", err);
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

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
import { FirebaseError } from '@firebase/util';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, 
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  errorCode: string = '';
  user: User | null = null;
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: this.fb.control(
        '', { nonNullable: true, validators: [
          Validators.required, 
          Validators.email,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')
        ] }
      ),
      password: this.fb.control(
        '', { nonNullable: true, validators: [Validators.required] }
      ),
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async handleSignIn() {
    try {
      const { email, password } = this.loginForm.value;
      await this.authService.signIn(email, password);
      this.router.navigate(['/']);
      this.toastService.notify(`Welcome back, ${email.split('@')[0]}!`); // placeholder
    } catch (err) {
      if (err instanceof FirebaseError) {
        this.errorCode = err.code;
      }
      console.log("Login error:", err);
    }
  }
 
  async handleGoogleSignIn() {
    try {
      const userCreds = await this.authService.signInWithGoogle();
      this.router.navigate(['/']);
      this.toastService.notify(`Welcome back, ${userCreds.user.displayName?.split(' ')[0]}!`);
    } catch (err) {
      console.log("Login error:", err);
    }
  }
}

import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup, 
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule
  ],
  standalone: true,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  forgotPwForm: FormGroup;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.forgotPwForm = this.fb.group({
      email: this.fb.control(
        '', { nonNullable: true, validators: [
          Validators.required, 
          Validators.email,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')
        ] }
      ),
    });
  }

  get email() {
    return this.forgotPwForm.get('email');
  }

  async handleResetPassword() {
    try {
      const { email } = this.forgotPwForm.value;
      await this.authService.resetPassword(email);
      this.router.navigate(['/login']);
      this.toastService.notify("Check your email (including spam) for the password reset link.");
    } catch (err) {
      // if (err instanceof FirebaseError) {
      //   this.errorCode = err.code;
      // }
      console.log("Login error:", err);
    }
  }

}

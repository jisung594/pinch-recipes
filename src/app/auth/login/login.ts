import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, 
    MatIconModule, 
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

  constructor(private authService: AuthService) {}

  async handleGoogleSignIn() {
    try {
      const userCreds = await this.authService.signInWithGoogle();
      console.log("Logged in as", userCreds.user);
    } catch (err) {
      console.log("Login error:", err);
    }
  }
}

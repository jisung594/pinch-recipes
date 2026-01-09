import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MatIconModule, MatMenu, MatMenuTrigger],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  // Called after input properties are set, but before DOM is ready
  ngOnInit() {
    this.authService.authState$.subscribe(user => {
      this.user = user;
    });
  }

  async handleGoogleSignIn() {
    try {
      const userCreds = await this.authService.signInWithGoogle();
      console.log("Logged in as", userCreds.user);
    } catch (err) {
      console.log("Login error:", err);
    }
  }

  async handleSignOut() {
    try {
      await this.authService.signOut();
      this.user = null;
      console.log("Signed out");
    } catch (err) {
      console.log("Sign-out error:", err);
    }
  }
}

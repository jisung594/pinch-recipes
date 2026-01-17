import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { Login } from '../auth/login/login';
import { User } from 'firebase/auth';
import { doc } from 'firebase/firestore';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    Login, 
    CommonModule, 
    RouterModule,
    MatIconModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // user$ = this.authService.authState$;
  user$!: Observable<User | null>;
  isMenuOpen = false;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.authState$;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

}

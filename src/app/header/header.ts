import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { AccountMenu } from '../auth/account-menu/account-menu';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AccountMenu, CommonModule, RouterModule, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  user$!: Observable<User | null>;
  isMenuOpen = false;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.authState$;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthFacadeService } from '../features/auth/services/auth.facade';
import { Observable } from 'rxjs';
import { AccountMenu } from '../auth/account-menu/account-menu';
import type { User } from 'firebase/auth';

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

  constructor(private authFacade: AuthFacadeService) {
    this.user$ = this.authFacade.authState$;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}

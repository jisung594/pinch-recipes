import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { Observable, Subscription } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-account-menu',
  imports: [CommonModule, RouterModule, MatIconModule, ClickOutsideDirective],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.css',
})
export class AccountMenu implements OnInit, OnDestroy {
  @Output() requestClose = new EventEmitter<void>();

  user: User | null = null;
  userProfile$!: Observable<UserProfile | null>;
  isDropdownOpen = false;
  private authSub?: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.userProfile$ = this.authService.userProfile$;
  }

  // Called after input properties are set, but before DOM is ready
  ngOnInit() {
    this.authSub = this.authService.authState$.subscribe((user) => {
      this.user = user;
    });
  }

  triggerCloseMenu() {
    try {
      this.requestClose.emit();
    } catch (err) {
      console.log('ERROR:', err);
    }
  }

  onAccountIconClick() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  async handleSignOut() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login']);
      this.triggerCloseMenu();
      this.user = null;
      console.log('Signed out');
    } catch (err) {
      console.log('Sign-out error:', err);
    }
  }

  ngOnDestroy() {
    // Clean up auth subscription to prevent memory leak
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}

import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { UserProfile } from '../../models/user-profile.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-account-menu',
  imports: [
    CommonModule,
    RouterModule, 
    MatIconModule, 
    MatMenu, 
    MatMenuTrigger
  ],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.css',
})
export class AccountMenu implements OnInit {
  @Output() requestClose = new EventEmitter<void>();

  // Creates references to observables set in AuthService
  user$: Observable<User | null>;
  userProfile$: Observable<UserProfile | null>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.authState$;
    this.userProfile$ = this.authService.userProfile$;
  }

  // Called after input properties are set, but before DOM is ready
  ngOnInit() {}

  triggerCloseMenu() {
    try {
      this.requestClose.emit();
    } catch (err) {
      console.log('ERROR:', err);
    }
  }

  async handleSignOut() {
    try {
      await this.authService.signOut();
      console.log("Signed out");
    } catch (err) {
      console.log("Sign-out error:", err);
    }
  }
}


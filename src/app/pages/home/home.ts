import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { Observable, Subscription } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';
import { SearchBar } from '../../search-bar/search-bar';
import { RecipesList } from '../../recipes-list/recipes-list';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [CommonModule, RouterModule, MatIconModule, SearchBar, RecipesList],
})
export class Home implements OnInit {
  private profileSubscription?: Subscription;
  private authSub?: Subscription;
  user: User | null = null;
  userProfile$!: Observable<UserProfile | null>;
  welcomeText = '';
  showButtons = false;
  searchTerm = '';

  constructor(private authService: AuthService) {
    this.userProfile$ = this.authService.userProfile$;

    this.authSub = this.authService.authState$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit() {
    // To unsubscribe from later
    this.profileSubscription = this.userProfile$.subscribe((profile) => {
      if (profile) {
        this.welcomeText = `Hello, ${profile?.displayName || profile?.firstName || 'maker'}.`;
      } else {
        this.welcomeText = 'PINCH';
      }
      this.showButtons = true;
    });
  }

  ngOnDestroy() {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { Observable, Subscription } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [CommonModule, RouterModule, MatIconModule]
})
export class Home implements OnInit {
  private typingInterval?: ReturnType<typeof setInterval>;
  private profileSubscription?: Subscription;
  user: User | null = null;
  userProfile$!: Observable<UserProfile | null>;
  displayName = '';
  typingSpeed = 120;
  showCursor = true;
  showButtons = false;

  constructor(private authService: AuthService) {
    this.userProfile$ = this.authService.userProfile$;

    this.authService.authState$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnInit() {
    // To unsubscribe from later
    this.profileSubscription = this.userProfile$.subscribe(profile => {
      if (profile) {
        const fullText = 'Hi,' + '\n' + (profile.displayName || profile.firstName || 'maker') + '.';
        this.typeText(fullText);
      }
    });
  }

  typeText(fullText: string) {
    // Clear any existing interval
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    // Reset display
    this.displayName = '';
    this.showCursor = true;
     this.showButtons = false;
    
    let index = 0;
    this.typingInterval = setInterval(() => {
      if (index < fullText.length) {
        this.displayName += fullText[index];
        index++;
      } else {
        clearInterval(this.typingInterval!);
        this.showCursor = false;

        // Pause briefly before buttons are shown
        setTimeout(() => {
          this.showButtons = true;
        }, 500);
      }
    }, this.typingSpeed);
  }

  ngOnDestroy() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }
}

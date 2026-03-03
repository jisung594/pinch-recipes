import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [CommonModule, RouterModule]
})
export class Home {
  user: User | null = null;
  userProfile$!: Observable<UserProfile | null>;

  constructor(private authService: AuthService) {
    this.userProfile$ = this.authService.userProfile$;

    this.authService.authState$.subscribe(user => {
      this.user = user;
    });
  }
}

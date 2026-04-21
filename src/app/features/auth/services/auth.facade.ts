import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'firebase/auth';
import { UserProfile } from '../../../models/user-profile.model';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

export interface AuthStatus {
  status: 'idle' | 'syncing' | 'error' | 'success';
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthFacadeService {
  private statusSubject = new BehaviorSubject<AuthStatus>({ status: 'idle' });
  public status$ = this.statusSubject.asObservable();

  // Granular state observables for template consumption
  public isAuthenticating$ = this.statusSubject.pipe(
    map((status: AuthStatus) => status.status === 'syncing')
  );
  
  public hasError$ = this.statusSubject.pipe(
    map((status: AuthStatus) => status.status === 'error')
  );
  
  public isIdle$ = this.statusSubject.pipe(
    map((status: AuthStatus) => status.status === 'idle')
  );

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  /**
   * Get current user authentication state
   * @returns Observable<User | null> - Current user state
   */
  get authState$(): Observable<User | null> {
    return this.authService.authState$;
  }

  /**
   * Get current user profile
   * @returns Observable<UserProfile | null> - Current user profile
   */
  get userProfile$(): Observable<UserProfile | null> {
    return this.authService.userProfile$;
  }

  /**
   * Get current demo mode state
   * @returns Observable<boolean> - Demo mode state
   */
  get isDemoMode$(): Observable<boolean> {
    return this.authService.isDemoMode;
  }

  /**
   * Sign in user with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise<void> - Resolves when sign in is complete
   */
  async signIn(email: string, password: string): Promise<void> {
    try {
      this.statusSubject.next({ status: 'syncing', message: 'Signing in...' });
      
      await this.authService.signIn(email, password);
      
      this.statusSubject.next({ status: 'success', message: 'Signed in successfully!' });
      this.toastService.notify(`Welcome back, ${email.split('@')[0]}!`);
      
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to sign in. Please try again.' 
      });
      this.toastService.notify('Failed to sign in. Please check your credentials.');
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign up new user
   * @param firstName - User first name
   * @param lastName - User last name
   * @param displayName - User display name
   * @param email - User email
   * @param password - User password
   * @returns Promise<void> - Resolves when sign up is complete
   */
  async signUp(firstName: string, lastName: string, displayName: string, email: string, password: string): Promise<void> {
    try {
      this.statusSubject.next({ status: 'syncing', message: 'Creating account...' });
      
      await this.authService.signUp(firstName, lastName, displayName, email, password);
      
      this.statusSubject.next({ status: 'success', message: 'Account created successfully!' });
      this.toastService.notify('You have been registered. Welcome to Pinch! 🍞');
      
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to create account.' 
      });
      this.toastService.notify('Failed to create account. Please try again.');
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google
   * @returns Promise<void> - Resolves when sign in is complete
   */
  async signInWithGoogle(): Promise<void> {
    try {
      this.statusSubject.next({ status: 'syncing', message: 'Signing in with Google...' });
      
      await this.authService.signInWithGoogle();
      
      this.statusSubject.next({ status: 'success', message: 'Signed in with Google!' });
      this.toastService.notify('Welcome to Pinch! 🍞');
      
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to sign in with Google.' 
      });
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign in as demo user
   * @returns Promise<void> - Resolves when sign in is complete
   */
  async signInAsDemo(): Promise<void> {
    try {
      this.statusSubject.next({ status: 'syncing', message: 'Signing in as demo user...' });
      
      await this.authService.signInAsDemo();
      
      this.statusSubject.next({ status: 'success', message: 'Signed in as demo user!' });
      this.toastService.notify('Welcome to Pinch Demo! 🍞');
      
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to sign in as demo user.' 
      });
      console.error('Demo sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   * @returns Promise<void> - Resolves when sign out is complete
   */
  async signOut(): Promise<void> {
    try {
      this.statusSubject.next({ status: 'syncing', message: 'Signing out...' });
      
      await this.authService.signOut();
      
      this.statusSubject.next({ status: 'idle' });
      
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to sign out.' 
      });
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   * @param email - User email for password reset
   * @returns Promise<void> - Resolves when reset email is sent
   */
  async resetPassword(email: string): Promise<void> {
    try {
      this.statusSubject.next({ status: 'syncing', message: 'Sending reset email...' });
      
      await this.authService.resetPassword(email);
      
      this.statusSubject.next({ status: 'success', message: 'Reset email sent!' });
      this.toastService.notify('Check your email (including spam) for password reset link.');
      
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to send reset email.' 
      });
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param userId - User ID to update
   * @param profileData - Profile data to update
   * @returns Promise<void> - Resolves when update is complete
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      this.statusSubject.next({ status: 'syncing', message: 'Updating profile...' });
      
      // Ensure uid is not overridden from partial data
      const cleanProfileData: Partial<UserProfile> = { ...profileData };
      delete cleanProfileData.uid; // Remove uid if present in partial data
      await this.authService.updateProfile(userId, cleanProfileData as UserProfile);
      
      this.statusSubject.next({ status: 'success', message: 'Profile updated successfully!' });
      this.toastService.notify('Profile updated successfully.');
      
    } catch (error) {
      this.statusSubject.next({ 
        status: 'error', 
        message: 'Failed to update profile.' 
      });
      this.toastService.notify('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   * @returns Promise<User | null> - Current user or null
   */
  async getCurrentUser(): Promise<User | null> {
    return await this.authService.getCurrentUser();
  }
}

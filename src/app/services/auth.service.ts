import { 
  authState, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { signInWithEmailAndPassword, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState$: Observable<User | null>;

  constructor(private auth: Auth) {
    // Initializes observable to make available immediately
    this.authState$ = authState(this.auth); // built-in Firebase Observable (manages + reacts to changes in authentication state)
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(this.auth, provider); // built-in Firebase function for handling signin via Google's popup window
      return result;
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error; 
    }
  }

  signOut() {
    return signOut(this.auth);
  }
}

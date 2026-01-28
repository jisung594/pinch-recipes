import { 
  authState, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from '@angular/fire/auth';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User 
} from 'firebase/auth';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  async signUp(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result;
    } catch (err) {
      console.error("Sign-in failed:", err);
      throw err; 
    }
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(this.auth, provider); // built-in Firebase function for handling signin via Google's popup window
      return result;
    } catch (err) {
      console.error("Google sign-in failed:", err);
      throw err; 
    }
  }

  signOut() {
    return signOut(this.auth);
  }
}

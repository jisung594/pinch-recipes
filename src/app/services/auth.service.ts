import { 
  authState, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from '@angular/fire/auth';
import { 
  doc,
  docData,
  setDoc, 
  Firestore, 
  serverTimestamp 
} from '@angular/fire/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  User 
} from 'firebase/auth';
import { UserProfile } from '../models/user-profile.model';
import { Injectable } from '@angular/core';
import { switchMap, of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Creates observables to expose user auth state and profile data (ie. to AccountMenu)
  authState$: Observable<User | null>;
  userProfile$: Observable<UserProfile | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    // Initializes observable to make available immediately
    this.authState$ = authState(this.auth); // built-in Firebase Observable (manages + reacts to changes in authentication state)
    
    // .pipe() allows for transforming observable data
    this.userProfile$ = this.authState$.pipe(
      // switchMap allows for switching to UserProfile observable when auth state changes 
      switchMap(user => {
        if (!user) {
          // Returns one-and-done observable with null value
          return of(null);
        }
        const userRef = doc(this.firestore, 'users', user.uid);

        // Returns an observable of user's profile data
        return docData(userRef) as Observable<UserProfile>;
      })
    );
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async signUp(
    firstName: string,
    lastName: string,
    displayName: string,
    email: string, 
    password: string
  ) {
    try {
      // Sets up user w/ Firebase auth
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = cred.user.uid;

      const userProfile: UserProfile = {
        uid,
        firstName,
        lastName,
        displayName,
        createdAt: serverTimestamp() as any,
      };

      // Stores profile data for appropriate user
      const userDocRef = doc(this.firestore, 'users', uid);
      await setDoc(userDocRef, userProfile);
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

  async resetPassword(email: string) {
    try {
      const result = sendPasswordResetEmail(this.auth, email);
      return result;
    } catch (err) {
      console.error("Password reset failed:", err);
      throw err; 
    }
  }
}

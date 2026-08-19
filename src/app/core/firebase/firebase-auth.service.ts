import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Observable, map } from 'rxjs';
import { AuthPort, AuthUser } from '../ports/auth.port';

@Injectable()
export class FirebaseAuthService implements AuthPort {
  private auth = inject(Auth);

  async login(email: string, password: string): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return { uid: credential.user.uid, email: credential.user.email };
  }

  async register(email: string, password: string): Promise<AuthUser> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    return { uid: credential.user.uid, email: credential.user.email };
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  authState(): Observable<AuthUser | null> {
    return authState(this.auth).pipe(
      map(user => (user ? { uid: user.uid, email: user.email } : null))
    );
  }
}

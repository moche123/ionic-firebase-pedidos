import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay } from 'rxjs';
import { AuthPort, AuthUser } from '../ports/auth.port';

const USERS_KEY = 'mock-auth-users-v1';
const SESSION_KEY = 'mock-auth-session-v1';
const LATENCY_MS = 250;

interface StoredUser {
  uid: string;
  email: string;
  password: string;
}

@Injectable()
export class MockAuthService implements AuthPort {
  private session$ = new BehaviorSubject<AuthUser | null>(this.loadSession());

  login(email: string, password: string): Promise<AuthUser> {
    const user = this.loadUsers().find(candidate => candidate.email === email);
    if (!user || user.password !== password) {
      return Promise.reject(new Error('auth/invalid-credentials'));
    }
    return this.startSession(user);
  }

  register(email: string, password: string): Promise<AuthUser> {
    const users = this.loadUsers();
    if (users.some(candidate => candidate.email === email)) {
      return Promise.reject(new Error('auth/email-already-in-use'));
    }
    const user: StoredUser = { uid: crypto.randomUUID(), email, password };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    return this.startSession(user);
  }

  logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
    this.session$.next(null);
    return Promise.resolve();
  }

  authState(): Observable<AuthUser | null> {
    return this.session$.pipe(delay(LATENCY_MS));
  }

  private startSession(user: StoredUser): Promise<AuthUser> {
    const authUser: AuthUser = { uid: user.uid, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    this.session$.next(authUser);
    return Promise.resolve(authUser);
  }

  private loadUsers(): StoredUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  }

  private loadSession(): AuthUser | null {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}

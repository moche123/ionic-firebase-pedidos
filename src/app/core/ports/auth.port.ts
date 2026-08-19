import { Observable } from 'rxjs';

export interface AuthUser {
  uid: string;
  email: string | null;
}

/**
 * Authentication contract. `FirebaseAuthService` and `MockAuthService`
 * implement this so the rest of the app never depends on which backend is active.
 */
export abstract class AuthPort {
  abstract login(email: string, password: string): Promise<AuthUser>;
  abstract register(email: string, password: string): Promise<AuthUser>;
  abstract logout(): Promise<void>;
  abstract authState(): Observable<AuthUser | null>;
}

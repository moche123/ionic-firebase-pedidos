import { Observable } from 'rxjs';

/**
 * Persistence contract. `FirebaseDatabaseService` and `MockDatabaseService`
 * implement this so the rest of the app never depends on which backend is active.
 */
export abstract class DatabasePort {
  abstract createDoc<T>(data: T, path: string, id: string): Promise<void>;
  abstract getDoc<T>(path: string, id: string): Observable<T | undefined>;
  abstract updateDoc<T>(data: Partial<T>, path: string, id: string): Promise<void>;
  abstract deleteDoc(path: string, id: string): Promise<void>;
  abstract getCollection<T>(path: string): Observable<T[]>;
  abstract newId(): string;
}

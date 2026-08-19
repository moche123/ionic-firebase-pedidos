import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../models';
import { DatabasePort } from '../ports/database.port';
import { mockImage } from './mock-image';

const STORAGE_KEY = 'mock-db-v1';
const LATENCY_MS = 250;

const SEED_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Classic Cheeseburger', regularPrice: 9.5, discountedPrice: 7.9, photoUrl: mockImage('🍔', 18), date: new Date() },
  { id: 'p2', name: 'Pepperoni Pizza', regularPrice: 14, discountedPrice: 11.5, photoUrl: mockImage('🍕', 4), date: new Date() },
  { id: 'p3', name: 'Salmon Sushi Set', regularPrice: 18, discountedPrice: 15, photoUrl: mockImage('🍣', 200), date: new Date() },
  { id: 'p4', name: 'Street Tacos (3x)', regularPrice: 8, discountedPrice: 6.5, photoUrl: mockImage('🌮', 40), date: new Date() },
  { id: 'p5', name: 'Garden Salad', regularPrice: 7, discountedPrice: 7, photoUrl: mockImage('🥗', 110), date: new Date() },
  { id: 'p6', name: 'Iced Lemonade', regularPrice: 3.5, discountedPrice: 3, photoUrl: mockImage('🍋', 55), date: new Date() },
];

type Store = Record<string, Record<string, unknown>>;

/**
 * In-memory + localStorage-backed stand-in for Firestore. Every "collection"
 * is just a dictionary of id -> document kept in a BehaviorSubject, so
 * getDoc/getCollection stay reactive the same way the Firebase implementation is.
 */
@Injectable()
export class MockDatabaseService implements DatabasePort {
  private store = new Map<string, BehaviorSubject<Record<string, unknown>>>();

  constructor() {
    const saved = this.loadFromStorage();
    if (saved) {
      for (const [path, docs] of Object.entries(saved)) {
        this.store.set(path, new BehaviorSubject(docs));
      }
    }
    if (!this.store.has('Products')) {
      const seeded: Record<string, unknown> = {};
      for (const product of SEED_PRODUCTS) {
        seeded[product.id] = product;
      }
      this.store.set('Products', new BehaviorSubject(seeded));
      this.persist();
    }
  }

  createDoc<T>(data: T, path: string, id: string): Promise<void> {
    this.subjectFor(path).next({ ...this.subjectFor(path).value, [id]: data });
    this.persist();
    return Promise.resolve();
  }

  getDoc<T>(path: string, id: string): Observable<T | undefined> {
    return this.subjectFor(path).pipe(
      map(docs => docs[id] as T | undefined),
      delay(LATENCY_MS)
    );
  }

  updateDoc<T>(data: Partial<T>, path: string, id: string): Promise<void> {
    const current = this.subjectFor(path).value;
    this.subjectFor(path).next({
      ...current,
      [id]: { ...(current[id] as object), ...data },
    });
    this.persist();
    return Promise.resolve();
  }

  deleteDoc(path: string, id: string): Promise<void> {
    const rest = { ...this.subjectFor(path).value };
    delete rest[id];
    this.subjectFor(path).next(rest);
    this.persist();
    return Promise.resolve();
  }

  getCollection<T>(path: string): Observable<T[]> {
    return this.subjectFor(path).pipe(
      map(docs => Object.values(docs) as T[]),
      delay(LATENCY_MS)
    );
  }

  newId(): string {
    return crypto.randomUUID();
  }

  private subjectFor(path: string): BehaviorSubject<Record<string, unknown>> {
    let subject = this.store.get(path);
    if (!subject) {
      subject = new BehaviorSubject<Record<string, unknown>>({});
      this.store.set(path, subject);
    }
    return subject;
  }

  private persist(): void {
    const snapshot: Store = {};
    for (const [path, subject] of this.store.entries()) {
      snapshot[path] = subject.value;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  private loadFromStorage(): Store | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Store;
    } catch {
      return null;
    }
  }
}

import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc as deleteFirestoreDoc,
  doc,
  docData,
  setDoc,
  updateDoc as updateFirestoreDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DatabasePort } from '../ports/database.port';

@Injectable()
export class FirebaseDatabaseService implements DatabasePort {
  private firestore = inject(Firestore);

  createDoc<T>(data: T, path: string, id: string): Promise<void> {
    return setDoc(doc(this.firestore, path, id), data as Record<string, unknown>);
  }

  getDoc<T>(path: string, id: string): Observable<T | undefined> {
    return docData(doc(this.firestore, path, id)) as Observable<T | undefined>;
  }

  updateDoc<T>(data: Partial<T>, path: string, id: string): Promise<void> {
    return updateFirestoreDoc(doc(this.firestore, path, id), data as Record<string, unknown>);
  }

  deleteDoc(path: string, id: string): Promise<void> {
    return deleteFirestoreDoc(doc(this.firestore, path, id));
  }

  getCollection<T>(path: string): Observable<T[]> {
    return collectionData(collection(this.firestore, path)) as Observable<T[]>;
  }

  newId(): string {
    return doc(collection(this.firestore, '_ids')).id;
  }
}

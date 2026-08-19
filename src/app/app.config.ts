import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthPort } from './core/ports/auth.port';
import { DatabasePort } from './core/ports/database.port';
import { StoragePort } from './core/ports/storage.port';
import { MockAuthService } from './core/mock/mock-auth.service';
import { MockDatabaseService } from './core/mock/mock-database.service';
import { MockStorageService } from './core/mock/mock-storage.service';
import { FirebaseAuthService } from './core/firebase/firebase-auth.service';
import { FirebaseDatabaseService } from './core/firebase/firebase-database.service';
import { FirebaseStorageService } from './core/firebase/firebase-storage.service';

// The mock backend needs no Firebase SDK initialization at all; the Firebase
// backend needs its providers set up once, from the config file swapped in by
// the "firebase" build configuration (see angular.json / environment.firebase.ts).
const backendProviders = environment.useMock
  ? [
      { provide: AuthPort, useClass: MockAuthService },
      { provide: DatabasePort, useClass: MockDatabaseService },
      { provide: StoragePort, useClass: MockStorageService },
    ]
  : [
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig!)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
      provideStorage(() => getStorage()),
      { provide: AuthPort, useClass: FirebaseAuthService },
      { provide: DatabasePort, useClass: FirebaseDatabaseService },
      { provide: StoragePort, useClass: FirebaseStorageService },
    ];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideIonicAngular({}),
    ...backendProviders,
  ],
};

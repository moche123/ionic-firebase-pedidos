/**
 * File storage contract. `FirebaseStorageService` and `MockStorageService`
 * implement this so the rest of the app never depends on which backend is active.
 */
export abstract class StoragePort {
  abstract uploadImage(file: File, path: string, name: string): Promise<string>;
}

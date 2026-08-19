import { Injectable, inject } from '@angular/core';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class FirebaseStorageService implements StoragePort {
  private storage = inject(Storage);

  async uploadImage(file: File, path: string, name: string): Promise<string> {
    const fileRef = ref(this.storage, `${path}/${name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }
}

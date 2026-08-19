import { Injectable } from '@angular/core';
import { StoragePort } from '../ports/storage.port';

@Injectable()
export class MockStorageService implements StoragePort {
  uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  LoadingController,
  MenuController,
  ToastController,
} from '@ionic/angular';
import { Product } from '../../models';
import { DatabasePort } from '../../core/ports/database.port';
import { StoragePort } from '../../core/ports/storage.port';

const PRODUCTS_PATH = 'Products';

function blankProduct(id: string): Product {
  return { id, name: '', regularPrice: 0, discountedPrice: 0, photoUrl: '', date: new Date() };
}

@Component({
  selector: 'app-product-settings',
  templateUrl: './product-settings.component.html',
  styleUrls: ['./product-settings.component.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
  ],
})
export class ProductSettingsComponent {
  private menuController = inject(MenuController);
  private database = inject(DatabasePort);
  private storage = inject(StoragePort);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  products = toSignal(this.database.getCollection<Product>(PRODUCTS_PATH), {
    initialValue: [] as Product[],
  });

  editing = false;
  draft: Product = blankProduct('');
  private newFile: File | undefined;

  openMenu(): void {
    this.menuController.toggle('main-menu');
  }

  newProduct(): void {
    this.editing = true;
    this.draft = blankProduct(this.database.newId());
    this.newFile = undefined;
  }

  editProduct(product: Product): void {
    this.editing = true;
    this.draft = { ...product };
    this.newFile = undefined;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.newFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.draft.photoUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async saveProduct(): Promise<void> {
    const loading = await this.loadingController.create({ message: 'Saving...' });
    await loading.present();

    if (this.newFile) {
      this.draft.photoUrl = await this.storage.uploadImage(this.newFile, PRODUCTS_PATH, this.draft.name);
    }

    try {
      await this.database.createDoc(this.draft, PRODUCTS_PATH, this.draft.id);
      await this.presentToast('Saved!');
      this.editing = false;
    } catch {
      await this.presentToast("Couldn't save the product.");
    } finally {
      await loading.dismiss();
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete product',
      message: `Are you sure you want to delete "${product.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.database.deleteDoc(PRODUCTS_PATH, product.id);
              await this.presentToast('Deleted.');
            } catch {
              await this.presentToast("Couldn't delete the product.");
            }
          },
        },
      ],
    });
    await alert.present();
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1200 });
    await toast.present();
  }
}

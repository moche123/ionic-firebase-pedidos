import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonTitle,
  IonToolbar,
  MenuController,
  ToastController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Customer } from '../../models';
import { AuthPort } from '../../core/ports/auth.port';
import { DatabasePort } from '../../core/ports/database.port';
import { StoragePort } from '../../core/ports/storage.port';

const CUSTOMERS_PATH = 'Customers';

function emptyCustomer(): Customer {
  return {
    uid: '',
    name: '',
    nationalId: '',
    email: '',
    phone: '',
    photoUrl: '',
    locationNote: '',
    location: null,
  };
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonInput,
  ],
})
export class ProfileComponent implements OnDestroy {
  private menuController = inject(MenuController);
  private auth = inject(AuthPort);
  private database = inject(DatabasePort);
  private storage = inject(StoragePort);
  private toastController = inject(ToastController);

  customer: Customer = emptyCustomer();
  uid = '';
  password = '';
  loginMode = false;
  private newFile: File | undefined;
  private customerSubscription?: Subscription;
  private authSubscription = this.auth.authState().subscribe(user => {
    if (user) {
      this.uid = user.uid;
      this.loadCustomer(user.uid);
    } else {
      this.uid = '';
      this.customer = emptyCustomer();
      this.customerSubscription?.unsubscribe();
    }
  });

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
    this.customerSubscription?.unsubscribe();
  }

  openMenu(): void {
    this.menuController.toggle('main-menu');
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.newFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.customer.photoUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async register(): Promise<void> {
    try {
      const user = await this.auth.register(this.customer.email, this.password);
      this.customer.uid = user.uid;
      await this.saveCustomer();
    } catch {
      await this.showToast("Couldn't create the account.", 'danger');
    }
  }

  async login(): Promise<void> {
    try {
      await this.auth.login(this.customer.email, this.password);
    } catch {
      await this.showToast('Invalid email or password.', 'danger');
    }
  }

  async saveCustomer(): Promise<void> {
    if (this.newFile) {
      this.customer.photoUrl = await this.storage.uploadImage(
        this.newFile,
        CUSTOMERS_PATH,
        this.customer.uid
      );
    }
    await this.database.createDoc(this.customer, CUSTOMERS_PATH, this.customer.uid);
    await this.showToast('Saved!', 'success');
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.password = '';
  }

  private loadCustomer(uid: string): void {
    this.customerSubscription?.unsubscribe();
    this.customerSubscription = this.database.getDoc<Customer>(CUSTOMERS_PATH, uid).subscribe(customer => {
      this.customer = customer ?? { ...emptyCustomer(), uid };
    });
  }

  private async showToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1500, color });
    await toast.present();
  }
}

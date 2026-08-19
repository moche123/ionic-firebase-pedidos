import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToolbar,
  MenuController,
} from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Product } from '../../models';
import { DatabasePort } from '../../core/ports/database.port';
import { ProductComponent } from '../../components/product/product.component';

const PRODUCTS_PATH = 'Products';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    RouterLink,
    ProductComponent,
  ],
})
export class HomeComponent {
  private menuController = inject(MenuController);
  private database = inject(DatabasePort);

  products = toSignal(this.database.getCollection<Product>(PRODUCTS_PATH), { initialValue: [] as Product[] });

  openMenu(): void {
    this.menuController.toggle('main-menu');
  }
}

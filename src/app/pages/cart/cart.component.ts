import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonList,
  IonTitle,
  IonToolbar,
  MenuController,
} from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { CartItemComponent } from '../../components/cart-item/cart-item.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonFooter,
    RouterLink,
    CartItemComponent,
  ],
})
export class CartComponent {
  private menuController = inject(MenuController);
  private router = inject(Router);
  cartService = inject(CartService);

  openMenu(): void {
    this.menuController.toggle('main-menu');
  }

  async checkout(): Promise<void> {
    const placedOrder = await this.cartService.checkout();
    if (placedOrder) {
      this.router.navigate(['/tracking']);
    }
  }
}

import { Component, Input, inject } from '@angular/core';
import { IonButton, IonIcon, IonImg, IonItem, IonLabel } from '@ionic/angular';
import { OrderItem } from '../../models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  imports: [IonItem, IonImg, IonLabel, IonButton, IonIcon],
})
export class CartItemComponent {
  @Input({ required: true }) item!: OrderItem;

  private cartService = inject(CartService);

  increase(): void {
    this.cartService.addProduct(this.item.product);
  }

  decrease(): void {
    this.cartService.removeProduct(this.item.product);
  }
}

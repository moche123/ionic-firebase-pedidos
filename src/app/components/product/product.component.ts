import { Component, Input, inject } from '@angular/core';
import { IonButton, IonCard, IonIcon, IonImg, ToastController } from '@ionic/angular';
import { Product } from '../../models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [IonCard, IonImg, IonIcon, IonButton],
})
export class ProductComponent {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);
  private toastController = inject(ToastController);

  async addToCart(): Promise<void> {
    const added = this.cartService.addProduct(this.product);
    if (!added) return;
    const toast = await this.toastController.create({
      message: `Added "${this.product.name}" to your cart`,
      duration: 1200,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }
}

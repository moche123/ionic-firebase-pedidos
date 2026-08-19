import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Customer, Order, OrderStatus, Product } from '../models';
import { AuthPort } from '../core/ports/auth.port';
import { DatabasePort } from '../core/ports/database.port';

const CUSTOMERS_PATH = 'Customers';
const ORDERS_PATH = 'Orders';

@Injectable({ providedIn: 'root' })
export class CartService {
  private auth = inject(AuthPort);
  private database = inject(DatabasePort);
  private router = inject(Router);

  private uid = '';
  private customer: Customer | null = null;

  readonly order = signal<Order | null>(null);
  readonly total = computed(() => {
    const order = this.order();
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.product.discountedPrice * item.quantity, 0);
  });

  /** The order currently being tracked on the /tracking page (set by checkout()). */
  readonly activeOrder = signal<Order | null>(null);

  constructor() {
    this.auth.authState().subscribe(user => {
      this.uid = user?.uid ?? '';
      if (user) {
        this.loadCustomer();
      } else {
        this.customer = null;
        this.order.set(null);
      }
    });
  }

  /** Returns false (and redirects to /profile) if there's no logged-in customer to add for. */
  addProduct(product: Product): boolean {
    if (!this.uid) {
      this.router.navigate(['/profile']);
      return false;
    }
    const order = this.order() ?? this.emptyOrder();
    const existing = order.items.find(item => item.product.id === product.id);
    const items = existing
      ? order.items.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [...order.items, { product, quantity: 1 }];
    this.saveOrder({ ...order, items });
    return true;
  }

  removeProduct(product: Product): void {
    const order = this.order();
    if (!order) return;
    const items = order.items
      .map(item =>
        item.product.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter(item => item.quantity > 0);
    this.saveOrder({ ...order, items });
  }

  /** Places the current cart as an order (for tracking) and resets the cart. */
  async checkout(): Promise<Order | null> {
    const order = this.order();
    if (!order || order.items.length === 0) return null;

    const placedOrder: Order = {
      ...order,
      id: this.database.newId(),
      totalPrice: this.total(),
      status: 'sent',
      date: new Date(),
    };
    this.activeOrder.set(placedOrder);

    await Promise.all([
      this.database.createDoc(placedOrder, ORDERS_PATH, placedOrder.id),
      this.saveOrder(this.emptyOrder()),
    ]);
    return placedOrder;
  }

  setOrderStatus(status: OrderStatus): Promise<void> {
    const order = this.activeOrder();
    if (!order) return Promise.resolve();
    const updated = { ...order, status };
    this.activeOrder.set(updated);
    return this.database.createDoc(updated, ORDERS_PATH, updated.id);
  }

  clearCart(): Promise<void> {
    return this.saveOrder(this.emptyOrder());
  }

  private loadCustomer(): void {
    this.database.getDoc<Customer>(CUSTOMERS_PATH, this.uid).subscribe(customer => {
      this.customer = customer ?? null;
      this.loadCart();
    });
  }

  private loadCart(): void {
    this.database.getDoc<Order>(this.cartPath(), this.uid).subscribe(order => {
      this.order.set(order ?? this.emptyOrder());
    });
  }

  private cartPath(): string {
    return `${CUSTOMERS_PATH}/${this.uid}/cart`;
  }

  private emptyOrder(): Order {
    return {
      id: this.uid,
      customer: this.customer,
      items: [],
      totalPrice: null,
      status: 'sent',
      date: new Date(),
      rating: null,
    };
  }

  private saveOrder(order: Order): Promise<void> {
    this.order.set(order);
    return this.database.createDoc(order, this.cartPath(), this.uid);
  }
}

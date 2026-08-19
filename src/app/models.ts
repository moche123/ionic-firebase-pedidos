export interface Customer {
  uid: string;
  name: string;
  nationalId: string;
  email: string;
  phone: string;
  photoUrl: string;
  locationNote: string;
  location: unknown;
}

export interface Product {
  id: string;
  name: string;
  regularPrice: number;
  discountedPrice: number;
  photoUrl: string;
  date: Date;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'sent' | 'seen' | 'on-the-way' | 'delivered';

export interface Order {
  id: string;
  customer: Customer | null;
  items: OrderItem[];
  totalPrice: number | null;
  date: Date;
  status: OrderStatus;
  rating: number | null;
}

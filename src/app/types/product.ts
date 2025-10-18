export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // 価格（円）
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

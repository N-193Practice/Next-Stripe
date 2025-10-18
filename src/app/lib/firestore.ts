import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase/client';
import { Product, Order } from '../types/product';

// 商品関連の関数
export const productService = {
  // 全商品を取得
  async getAllProducts(): Promise<Product[]> {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[];
  },

  // 商品をIDで取得
  async getProductById(id: string): Promise<Product | null> {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      return null;
    }
    
    return {
      id: productSnap.id,
      ...productSnap.data(),
      createdAt: productSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: productSnap.data().updatedAt?.toDate() || new Date(),
    } as Product;
  },

  // 商品を追加
  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // 商品を更新
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // 商品を削除
  async deleteProduct(id: string): Promise<void> {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
  },
};

// 注文関連の関数
export const orderService = {
  // 注文を作成
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // 注文を取得
  async getOrderById(id: string): Promise<Order | null> {
    const orderRef = doc(db, 'orders', id);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return null;
    }
    
    return {
      id: orderSnap.id,
      ...orderSnap.data(),
      createdAt: orderSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: orderSnap.data().updatedAt?.toDate() || new Date(),
    } as Order;
  },

  // 注文を更新
  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    const orderRef = doc(db, 'orders', id);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },
};

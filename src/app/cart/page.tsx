'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CartItem } from '../types/product';

/**
 * カートページコンポーネント
 * ローカルストレージからカートデータを取得し、商品の表示・編集・削除機能を提供
 */
export default function Cart() {
  // カートアイテムとローディング状態の管理
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // コンポーネントマウント時にローカルストレージからカートデータを取得
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
    setLoading(false);
  }, []);

  /**
   * 商品の数量を更新する関数
   * @param productId 商品ID
   * @param newQuantity 新しい数量
   */
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    // カートアイテムの数量を更新
    const updatedCart = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  /**
   * カートから商品を削除する関数
   * @param productId 削除する商品のID
   */
  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  /**
   * カートを空にする関数
   */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // カート内の商品の合計金額を計算
  const totalAmount = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // ローディング状態の表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-3xl font-bold text-gray-900">
              ECサイト
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                商品一覧
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ショッピングカート</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">カートに商品がありません</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
              商品を見る
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-black">カートの商品</h2>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      カートを空にする
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <Image
                          src={item.product.imageUrl || '/placeholder-image.jpg'}
                          alt={item.product.title}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-black">{item.product.title}</h3>
                          <p className="text-black text-sm">{item.product.description}</p>
                          <p className="text-black font-medium">¥{item.product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center hover:bg-gray-100 text-black"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center hover:bg-gray-100 text-black"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-black">
                            ¥{(item.product.price * item.quantity).toLocaleString()}
                          </p>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-black mb-4">注文概要</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-black">
                    <span>小計:</span>
                    <span>¥{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>送料:</span>
                    <span>¥0</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg text-black">
                      <span>合計:</span>
                      <span>¥{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-medium text-center block"
                >
                  レジに進む
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

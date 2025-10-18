'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrderSuccess() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // URLパラメータから注文IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('orderId');
    setOrderId(id);

    // カートをクリア
    localStorage.removeItem('cart');
    
    // 注文履歴に追加（ローカルストレージ）
    if (id) {
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      // カートから注文データを取得
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalAmount = cartItems.reduce((total: number, item: any) => total + (item.product.price * item.quantity), 0);
      
      orderHistory.push({
        id,
        items: cartItems,
        totalAmount,
        status: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-3xl font-bold text-gray-900">
              ECサイト
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ご注文ありがとうございます！
          </h1>
          
          <p className="text-gray-600 mb-6">
            お支払いが正常に完了しました。注文確認メールをお送りいたします。
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">注文番号</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              商品一覧に戻る
            </Link>
            <Link
              href="/orders"
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium"
            >
              注文履歴を見る
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

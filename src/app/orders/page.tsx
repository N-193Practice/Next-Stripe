'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '../types/product';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // 実際のアプリでは認証されたユーザーの注文を取得
        // ここでは簡単のため、ローカルストレージから注文履歴を取得
        const savedOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        console.log('取得した注文履歴:', savedOrders);
        setOrders(savedOrders);
      } catch (error) {
        console.error('注文履歴の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '処理中',
      paid: '支払い完了',
      shipped: '発送済み',
      delivered: '配送完了',
      cancelled: 'キャンセル',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

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
            <Link href="/" className="text-3xl font-bold text-black">
              ECサイト
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                商品一覧
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">注文履歴</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">注文履歴がありません</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
              商品を見る
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      注文番号: {order.id}
                    </h3>
                    <p className="text-sm text-black">
                      注文日: {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <p className="text-lg font-bold text-black mt-1">
                      ¥{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-black mb-2">注文商品</h4>
                  <div className="space-y-2">
                    {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Image
                          src={item.product.imageUrl || '/placeholder-image.jpg'}
                          alt={item.product.title}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-black">{item.product.title}</p>
                          <p className="text-sm text-black">数量: {item.quantity}</p>
                        </div>
                        <p className="text-black">
                          ¥{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    )) : (
                      <p className="text-black">注文商品の情報がありません</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

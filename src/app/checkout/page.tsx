'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CartItem } from '../types/product';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe Elements用の決済フォームコンポーネント
function PaymentForm({ orderId, onSuccess }: { 
  orderId: string; 
  onSuccess: () => void; 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    console.log('決済処理を開始します');
    console.log('Stripe:', stripe);
    console.log('Elements:', elements);
    console.log('Order ID:', orderId);

    if (!stripe || !elements) {
      console.error('StripeまたはElementsが初期化されていません');
      return;
    }

    setProcessing(true);

    try {
      console.log('confirmPaymentを呼び出します');
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
        },
      });

      console.log('confirmPaymentの結果:', { error });

      if (error) {
        console.error('決済エラー:', error);
        console.error('エラー詳細:', JSON.stringify(error, null, 2));
        alert('決済に失敗しました: ' + (error.message || '不明なエラーが発生しました'));
      } else {
        console.log('決済が成功しました');
        onSuccess();
      }
    } catch (error) {
      console.error('決済処理エラー:', error);
      alert('決済処理中にエラーが発生しました');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          支払い情報
        </label>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!stripe || !elements || processing}
        className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400"
      >
        {processing ? '処理中...' : '支払う'}
      </button>
    </div>
  );
}

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      router.push('/');
      return;
    }
    setCartItems(cart);
    setLoading(false);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // 注文データを準備
      const orderData = {
        items: cartItems,
        totalAmount: cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0),
        customerInfo,
      };

      console.log('注文データ:', orderData);

      // Stripe決済処理を開始
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('APIレスポンス:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('APIエラー:', errorData);
        throw new Error(`APIエラー: ${errorData.error || '不明なエラー'}`);
      }

      const { clientSecret: secret, orderId: id } = await response.json();
      console.log('Client Secret:', secret);
      console.log('Order ID:', id);

      if (!secret) {
        throw new Error('決済処理の開始に失敗しました');
      }

      setClientSecret(secret);
      setOrderId(id);
    } catch (error) {
      console.error('決済処理エラー:', error);
      alert('決済処理中にエラーが発生しました');
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

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
              <Link href="/cart" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                カートに戻る
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">お支払い情報</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">お客様情報</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    住所 *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      市区町村 *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      郵便番号 *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={customerInfo.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                {clientSecret && orderId ? (
                  <Elements 
                    stripe={loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)} 
                    options={{ 
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#0570de',
                        },
                      },
                    }}
                  >
                    <PaymentForm 
                      orderId={orderId} 
                      onSuccess={() => console.log('決済成功')} 
                    />
                  </Elements>
                ) : (
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400"
                  >
                    {processing ? '処理中...' : `¥${totalAmount.toLocaleString()} で支払う`}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">注文内容</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4">
                    <Image
                      src={item.product.imageUrl || '/placeholder-image.jpg'}
                      alt={item.product.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                      <p className="text-gray-600 text-sm">数量: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ¥{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>合計:</span>
                  <span>¥{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '../../types/product';
import { productService } from '../../lib/firestore';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(params.id as string);
        if (!data) {
          router.push('/');
          return;
        }
        setProduct(data);
      } catch (error) {
        console.error('商品の取得に失敗しました:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const addToCart = () => {
    if (!product) return;
    
    // ローカルストレージからカートを取得
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // 既存の商品をチェック
    const existingItem = cart.find((item: any) => item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        product: product,
        quantity: quantity,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('カートに追加しました');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">商品が見つかりません</div>
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
              <Link href="/cart" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                カート
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <img
                src={product.imageUrl || '/placeholder-image.jpg'}
                alt={product.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">¥{product.price.toLocaleString()}</span>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数量
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 w-20"
                >
                  {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={addToCart}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  カートに追加
                </button>
                <Link
                  href="/cart"
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
                >
                  今すぐ購入
                </Link>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>在庫数: {product.stock}個</p>
                <p>カテゴリ: {product.category}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

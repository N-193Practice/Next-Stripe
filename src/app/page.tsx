
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from './types/product';
import { productService } from './lib/firestore';

/**
 * ホームページコンポーネント
 * 商品一覧を表示し、カートや商品詳細ページへのナビゲーションを提供
 */
export default function Home() {
  // 商品データの状態管理
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // コンポーネントマウント時に商品データを取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Firestoreから全商品データを取得
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('商品の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      {/* ヘッダー部分 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">ECサイト</h1>
            <div className="flex space-x-4">
              {/* カートページへのリンク */}
              <Link href="/cart" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                カート
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ部分 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">商品一覧</h2>
        
        {/* 商品がない場合の表示 */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">商品がありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* 商品画像 */}
                <div className="aspect-w-16 aspect-h-9">
                  <Image
                    src={product.imageUrl || '/placeholder-image.jpg'}
                    alt={product.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                </div>
                {/* 商品情報 */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">¥{product.price.toLocaleString()}</span>
                    {/* 商品詳細ページへのリンク */}
                    <Link
                      href={`/products/${product.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      詳細を見る
                    </Link>
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

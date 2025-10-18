'use client';

import { useState } from 'react';
import Link from 'next/link';
import { seedProducts } from '../../lib/seed-data';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await seedProducts();
      setMessage('サンプル商品データの追加が完了しました！');
    } catch (error) {
      setMessage('エラーが発生しました: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-3xl font-bold text-gray-900">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">管理画面</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">サンプルデータ</h2>
              <p className="text-gray-600 mb-4">
                サンプル商品データをFirestoreに追加します。開発・テスト用です。
              </p>
              
              <button
                onClick={handleSeed}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400"
              >
                {loading ? '追加中...' : 'サンプル商品データを追加'}
              </button>
              
              {message && (
                <div className={`mt-4 p-4 rounded-md ${
                  message.includes('完了') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">注意事項</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• この機能は開発・テスト用です</li>
                <li>• 本番環境では使用しないでください</li>
                <li>• 既存の商品データがある場合は重複する可能性があります</li>
                <li>• Firebaseの設定が正しく行われている必要があります</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

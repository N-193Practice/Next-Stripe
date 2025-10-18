import { productService } from './firestore';

export const sampleProducts = [
  {
    title: 'ワイヤレスイヤホン',
    description: '高音質なワイヤレスイヤホン。長時間の使用でも快適です。',
    price: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'オーディオ',
    stock: 50,
  },
  {
    title: 'スマートウォッチ',
    description: '健康管理とスマートフォン連携ができるスマートウォッチ。',
    price: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'ウェアラブル',
    stock: 30,
  },
  {
    title: 'Bluetoothスピーカー',
    description: '持ち運び可能なコンパクトなBluetoothスピーカー。',
    price: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    category: 'オーディオ',
    stock: 25,
  },
  {
    title: 'ワイヤレスマウス',
    description: 'エルゴノミクスデザインのワイヤレスマウス。',
    price: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    category: 'PCアクセサリー',
    stock: 100,
  },
  {
    title: 'USB-Cケーブル',
    description: '高速充電対応のUSB-Cケーブル。1m長。',
    price: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    category: 'ケーブル',
    stock: 200,
  },
  {
    title: 'モバイルバッテリー',
    description: '大容量10000mAhのモバイルバッテリー。',
    price: 6000,
    imageUrl: 'https://images.unsplash.com/photo-1609592807900-0b8b0a4a0b8b?w=400',
    category: 'バッテリー',
    stock: 40,
  },
];

export async function seedProducts() {
  try {
    console.log('サンプル商品データを追加中...');
    
    for (const product of sampleProducts) {
      await productService.addProduct(product);
      console.log(`商品を追加しました: ${product.title}`);
    }
    
    console.log('サンプル商品データの追加が完了しました！');
  } catch (error) {
    console.error('サンプル商品データの追加に失敗しました:', error);
  }
}

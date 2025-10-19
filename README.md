# Next.js + Stripe + Firebase 決済アプリ

Next.js、Stripe、Firebaseを使用した完全な決済処理アプリケーションです。実際のECサイトのような機能を実装しています。

## 🚀 実装済み機能

### 商品管理
- ✅ 商品一覧表示（レスポンシブ対応）
- ✅ 商品詳細ページ
- ✅ 商品画像表示（Next.js Image最適化）
- ✅ カテゴリ別表示対応

### ショッピングカート
- ✅ 商品の追加・削除
- ✅ 数量変更
- ✅ ローカルストレージでの永続化
- ✅ カート合計金額計算

### 決済処理
- ✅ Stripe Elements（PaymentElement）を使用
- ✅ クレジットカード決済
- ✅ 決済成功・失敗の処理
- ✅ 決済完了後のリダイレクト

### 注文管理
- ✅ 注文履歴表示
- ✅ 注文ステータス管理
- ✅ 注文詳細情報表示

### データベース
- ✅ Firebase Firestore での商品データ管理
- ✅ 注文データの永続化
- ✅ サンプルデータの自動投入

## 🛠 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **決済処理**: Stripe Elements, Payment Intent API
- **データベース**: Firebase Firestore
- **画像最適化**: Next.js Image
- **UI/UX**: レスポンシブデザイン、モダンなUI

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe設定
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Firestore Database を有効化
3. 認証設定（必要に応じて）
4. プロジェクト設定から設定値を取得して `.env.local` に設定

### 4. Stripe アカウントの設定

1. [Stripe Dashboard](https://dashboard.stripe.com/) でアカウントを作成
2. API キーを取得して `.env.local` に設定
3. テストモードで動作確認

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

### 6. サンプルデータの追加

開発・テスト用にサンプル商品データを追加する場合：

1. [http://localhost:3000/admin/seed](http://localhost:3000/admin/seed) にアクセス
2. 「サンプル商品データを追加」ボタンをクリック

## 📁 プロジェクト構造

```
src/
├── app/
│   ├── api/                    # API ルート
│   │   └── create-payment-intent/  # Stripe決済API
│   ├── admin/                  # 管理画面
│   │   └── seed/              # サンプルデータ投入
│   ├── cart/                   # カートページ
│   ├── checkout/               # 決済ページ（Stripe Elements）
│   ├── order-success/          # 決済成功ページ
│   ├── orders/                 # 注文履歴ページ
│   ├── products/               # 商品詳細ページ
│   │   └── [id]/              # 動的ルート
│   ├── lib/                    # ユーティリティ
│   │   ├── firebase/          # Firebase設定
│   │   ├── firestore.ts       # Firestore操作
│   │   ├── stripe.ts          # Stripe設定
│   │   └── seed-data.ts       # サンプルデータ
│   ├── types/                  # TypeScript型定義
│   │   └── product.ts         # 商品・注文の型定義
│   └── globals.css            # グローバルスタイル
```

## 🎯 アプリケーションの流れ

### 1. 商品閲覧
- ホームページで商品一覧を表示
- 商品詳細ページで詳細情報を確認

### 2. ショッピングカート
- 商品をカートに追加
- 数量を調整
- カート内容を確認

### 3. 決済処理
- お客様情報を入力
- Stripe Elementsでカード情報を入力
- 決済を実行

### 4. 注文完了
- 決済成功ページにリダイレクト
- 注文履歴に保存
- カートをクリア

## 🧪 テスト方法

### Stripeテストカード
- **成功**: `4242 4242 4242 4242`
- **失敗**: `4000 0000 0000 0002`
- **3Dセキュア**: `4000 0025 0000 3155`

### テスト手順
1. サンプルデータを投入
2. 商品をカートに追加
3. 決済ページでテストカードを使用
4. 注文履歴で確認

## 🚀 デプロイ

### Vercel でのデプロイ（推奨）

1. GitHub リポジトリにプッシュ
2. [Vercel](https://vercel.com/) でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

### 環境変数の設定（本番環境）

```env
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe設定（本番環境）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 📚 学習ポイント

このアプリケーションで学べる技術：

- **Next.js 15**: App Router, Server Components, API Routes
- **Stripe**: Payment Intent API, Elements, 決済フロー
- **Firebase**: Firestore, リアルタイムデータベース
- **TypeScript**: 型安全性, インターフェース設計
- **Tailwind CSS**: レスポンシブデザイン, ユーティリティファースト
- **React Hooks**: useState, useEffect, カスタムフック

## 📄 ライセンス

このプロジェクトはプライベートプロジェクトです。

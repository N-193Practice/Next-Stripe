// lib/firebase/client.ts

// インストールしたSDKから必要な関数をインポート
import { initializeApp, getApps, getApp } from 'firebase/app'; 
import { getAuth } from 'firebase/auth'; // 認証を使用する場合
import { getFirestore } from 'firebase/firestore'; // Firestoreを使用する場合

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, //トラッキングID（必要に応じて）
};

// 既に初期化済みの場合はそのインスタンスを使用、そうでない場合は初期化
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 各サービス（Auth, Firestoreなど）のインスタンスを取得し、エクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
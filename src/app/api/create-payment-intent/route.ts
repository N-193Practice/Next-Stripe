import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../lib/stripe';
import { orderService } from '../../lib/firestore';

/**
 * Stripe Payment Intentを作成するAPIエンドポイント
 * 決済処理のためのPayment Intentを作成し、注文データをFirestoreに保存
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディから商品データ、合計金額、顧客情報を取得
    const { items, totalAmount, customerInfo } = await request.json();

    // 注文データをFirestoreに保存
    const orderId = await orderService.createOrder({
      userId: 'anonymous', // 実際のアプリでは認証されたユーザーIDを使用
      items,
      totalAmount,
      status: 'pending',
    });

    // Stripe PaymentIntentを作成（決済処理のためのオブジェクト）
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount, // 金額（円）
      currency: 'jpy',
      metadata: {
        orderId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
      },
    });

    // クライアントシークレットと注文IDを返す
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
    });
  } catch (error) {
    // エラーログを出力し、エラーレスポンスを返す
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: 'Payment intent creation failed' },
      { status: 500 }
    );
  }
}

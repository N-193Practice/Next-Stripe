import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../lib/stripe';
import { orderService } from '../../lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const { items, totalAmount, customerInfo } = await request.json();

    // 注文をFirestoreに保存
    const orderId = await orderService.createOrder({
      userId: 'anonymous', // 実際のアプリでは認証されたユーザーIDを使用
      items,
      totalAmount,
      status: 'pending',
    });

    // Stripe PaymentIntentを作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount, // 金額（円）
      currency: 'jpy',
      metadata: {
        orderId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: 'Payment intent creation failed' },
      { status: 500 }
    );
  }
}

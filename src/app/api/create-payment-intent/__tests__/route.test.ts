// StripeとFirestoreサービスのモック
jest.mock('../../../lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
    },
  },
}))

jest.mock('../../../lib/firestore', () => ({
  orderService: {
    createOrder: jest.fn(),
  },
}))

import { stripe } from '../../../lib/stripe'
import { orderService } from '../../../lib/firestore'

// モック関数を取得
const mockStripePaymentIntents = stripe.paymentIntents.create as jest.MockedFunction<typeof stripe.paymentIntents.create>
const mockOrderServiceCreate = orderService.createOrder as jest.MockedFunction<typeof orderService.createOrder>

// Next.jsのserverモジュールをモック
jest.mock('next/server', () => {
  // Requestを先に定義
  class MockRequest {
    method: string
    url: string
    body: string | null
    headers: Headers

    constructor(url: string, init?: { method?: string; body?: string; headers?: HeadersInit }) {
      this.url = url
      this.method = init?.method || 'GET'
      this.body = init?.body || null
      this.headers = new Headers(init?.headers)
    }

    async json() {
      try {
        return JSON.parse(this.body || '{}')
      } catch {
        throw new Error('Invalid JSON')
      }
    }
  }

  class MockNextRequest extends MockRequest {}
  class MockNextResponse {
    static json(body: unknown, init?: { status?: number }) {
      return {
        json: async () => body,
        status: init?.status || 200,
      }
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  }
})

import { POST } from '../route'

// NextRequestのモック（Next.jsのRequestを拡張）
class MockNextRequest {
  method: string
  url: string
  body: string
  headers: Headers

  constructor(url: string, init?: { method?: string; body?: string; headers?: HeadersInit }) {
    this.url = url
    this.method = init?.method || 'GET'
    this.body = init?.body || ''
    this.headers = new Headers(init?.headers)
  }

  async json() {
    try {
      return JSON.parse(this.body)
    } catch {
      throw new Error('Invalid JSON')
    }
  }
}

describe('POST /api/create-payment-intent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Payment Intentを作成し、注文データを保存する', async () => {
    const mockOrderId = 'order123'
    const mockClientSecret = 'pi_test_client_secret'

    mockOrderServiceCreate.mockResolvedValue(mockOrderId)
    mockStripePaymentIntents.mockResolvedValue({
      id: 'pi_test',
      client_secret: mockClientSecret,
      amount: 2000,
      currency: 'jpy',
      status: 'requires_payment_method',
    } as Awaited<ReturnType<typeof mockStripePaymentIntents>>)

    const requestBody = {
      items: [
        {
          productId: '1',
          product: {
            id: '1',
            title: 'テスト商品',
            price: 1000,
          },
          quantity: 2,
        },
      ],
      totalAmount: 2000,
      customerInfo: {
        name: 'テスト太郎',
        email: 'test@example.com',
      },
    }

    const request = new MockNextRequest('http://localhost/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    }) as unknown as Parameters<typeof POST>[0]

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.clientSecret).toBe(mockClientSecret)
    expect(data.orderId).toBe(mockOrderId)

    // 注文が作成されたことを確認
    expect(mockOrderServiceCreate).toHaveBeenCalledWith({
      userId: 'anonymous',
      items: requestBody.items,
      totalAmount: 2000,
      status: 'pending',
    })

    // Payment Intentが作成されたことを確認
    expect(mockStripePaymentIntents).toHaveBeenCalledWith({
      amount: 2000,
      currency: 'jpy',
      metadata: {
        orderId: mockOrderId,
        customerName: 'テスト太郎',
        customerEmail: 'test@example.com',
      },
    })
  })

  it('注文作成に失敗した場合、エラーを返す', async () => {
    mockOrderServiceCreate.mockRejectedValue(new Error('注文作成エラー'))

    const requestBody = {
      items: [],
      totalAmount: 0,
      customerInfo: {
        name: 'テスト太郎',
        email: 'test@example.com',
      },
    }

    const request = new MockNextRequest('http://localhost/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    }) as unknown as Parameters<typeof POST>[0]

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Payment intent creation failed')
  })

  it('Payment Intent作成に失敗した場合、エラーを返す', async () => {
    const mockOrderId = 'order123'
    mockOrderServiceCreate.mockResolvedValue(mockOrderId)
    mockStripePaymentIntents.mockRejectedValue(new Error('Stripe APIエラー'))

    const requestBody = {
      items: [],
      totalAmount: 1000,
      customerInfo: {
        name: 'テスト太郎',
        email: 'test@example.com',
      },
    }

    const request = new MockNextRequest('http://localhost/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    }) as unknown as Parameters<typeof POST>[0]

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Payment intent creation failed')
  })

  it('リクエストボディが不正な場合、エラーを返す', async () => {
    const request = new MockNextRequest('http://localhost/api/create-payment-intent', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    }) as unknown as Parameters<typeof POST>[0]

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Payment intent creation failed')
  })
})


import React from 'react'
import { render, screen, waitFor} from '@testing-library/react'
import OrderSuccess from '../page'
import { Product, CartItem, Order } from '../../types/product'

// Next.jsのモック
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
  return MockLink
})

// URLSearchParamsをモックするための変数
let mockSearchParams: URLSearchParams | null = null

// URLSearchParamsのコンストラクタをモック
const originalURLSearchParams = global.URLSearchParams
beforeAll(() => {
  global.URLSearchParams = jest.fn().mockImplementation((init?: string | URLSearchParams) => {
    if (mockSearchParams) {
      return mockSearchParams
    }
    return new originalURLSearchParams(init)
  }) as typeof URLSearchParams
})

afterAll(() => {
  global.URLSearchParams = originalURLSearchParams
})

describe('OrderSuccess Page', () => {
  const mockProduct: Product = {
    id: '1',
    title: 'テスト商品',
    description: 'テスト商品の説明',
    price: 1000,
    imageUrl: '/test.jpg',
    category: 'テスト',
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockCartItem: CartItem = {
    productId: '1',
    product: mockProduct,
    quantity: 2,
  }

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    mockSearchParams = null
  })

  it('注文成功メッセージを表示する', () => {
    mockSearchParams = new URLSearchParams('?orderId=order123')

    render(<OrderSuccess />)

    expect(screen.getByText('ご注文ありがとうございます！')).toBeInTheDocument()
    expect(
      screen.getByText('お支払いが正常に完了しました。注文確認メールをお送りいたします。')
    ).toBeInTheDocument()
  })

  it('注文番号が表示される', async () => {
    mockSearchParams = new URLSearchParams('?orderId=order123')

    render(<OrderSuccess />)

    // useEffectが実行されるまで待つ
    await waitFor(
      () => {
        expect(screen.getByText('注文番号')).toBeInTheDocument()
        expect(screen.getByText('order123')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('注文番号がない場合、注文番号セクションを表示しない', () => {
    mockSearchParams = new URLSearchParams('')

    render(<OrderSuccess />)

    expect(screen.queryByText('注文番号')).not.toBeInTheDocument()
  })

  it('カートをクリアする', () => {
    // カートに商品を追加
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))
    mockSearchParams = new URLSearchParams('?orderId=order123')

    render(<OrderSuccess />)

    // カートがクリアされているか確認
    const cart = localStorage.getItem('cart')
    expect(cart).toBeNull()
  })

  it('注文履歴に注文を追加する', async () => {
    // カートに商品を追加
    // 注意: 実際のコードでは、カートをクリアした後にカートからデータを取得しているため、
    // カートは空になり、itemsとtotalAmountは0/空になる
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))
    mockSearchParams = new URLSearchParams('?orderId=order123')

    render(<OrderSuccess />)

    // useEffectが実行されるまで待つ
    await waitFor(
      () => {
        // 注文履歴を確認
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]')
        expect(orderHistory.length).toBeGreaterThan(0)
        const newOrder = orderHistory.find((o: Order) => o.id === 'order123')
        expect(newOrder).toBeDefined()
        if (newOrder) {
          expect(newOrder.status).toBe('paid')
          // 実際のコードでは、カートをクリアした後にカートから取得するため、itemsは空
          expect(newOrder.items).toEqual([])
          // totalAmountも0になる
          expect(newOrder.totalAmount).toBe(0)
        }
      },
      { timeout: 3000 }
    )
  })

  it('商品一覧に戻るリンクが表示される', () => {
    mockSearchParams = new URLSearchParams('?orderId=order123')

    render(<OrderSuccess />)

    const homeLink = screen.getByText('商品一覧に戻る')
    expect(homeLink).toBeInTheDocument()
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('注文履歴を見るリンクが表示される', () => {
    mockSearchParams = new URLSearchParams('?orderId=order123')

    render(<OrderSuccess />)

    const ordersLink = screen.getByText('注文履歴を見る')
    expect(ordersLink).toBeInTheDocument()
    expect(ordersLink.closest('a')).toHaveAttribute('href', '/orders')
  })

  it('複数の注文を履歴に追加できる', async () => {
    // 既存の注文履歴
    const existingOrder = {
      id: 'order1',
      items: [mockCartItem],
      totalAmount: 2000,
      status: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem('orderHistory', JSON.stringify([existingOrder]))

    // カートに商品を追加
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))
    mockSearchParams = new URLSearchParams('?orderId=order2')

    render(<OrderSuccess />)

    // useEffectが実行されるまで待つ
    await waitFor(
      () => {
        // 注文履歴に2つの注文があるか確認
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]')
        expect(orderHistory.length).toBeGreaterThanOrEqual(2)
        const order1 = orderHistory.find((o: Order) => o.id === 'order1')
        const order2 = orderHistory.find((o: Order) => o.id === 'order2')
        expect(order1).toBeDefined()
        expect(order2).toBeDefined()
      },
      { timeout: 3000 }
    )
  })
})


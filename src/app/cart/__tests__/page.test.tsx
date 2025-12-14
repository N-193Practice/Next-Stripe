import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Cart from '../page'

// Next.jsのモック
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
  return MockLink
})

jest.mock('next/image', () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />
  }
  return MockImage
})

describe('Cart Page', () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('カートが空の場合、空のメッセージを表示する', () => {
    render(<Cart />)
    
    expect(screen.getByText('カートに商品がありません')).toBeInTheDocument()
    expect(screen.getByText('商品を見る')).toBeInTheDocument()
  })

  it('カートに商品がある場合、商品一覧を表示する', async () => {
    const mockCartItems = [
      {
        productId: '1',
        product: {
          id: '1',
          title: 'テスト商品',
          description: 'テスト商品の説明',
          price: 1000,
          imageUrl: '/test.jpg',
          stock: 10,
          category: 'テスト',
        },
        quantity: 2,
      },
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<Cart />)

    await waitFor(() => {
      expect(screen.getByText('テスト商品')).toBeInTheDocument()
      expect(screen.getByText('テスト商品の説明')).toBeInTheDocument()
      // 価格は複数箇所に表示されるため、getAllByTextを使用
      const prices = screen.getAllByText('¥1,000')
      expect(prices.length).toBeGreaterThan(0)
      const totalPrices = screen.getAllByText('¥2,000')
      expect(totalPrices.length).toBeGreaterThan(0)
    })
  })

  it('数量を増やすボタンをクリックすると数量が増える', async () => {
    const mockCartItems = [
      {
        productId: '1',
        product: {
          id: '1',
          title: 'テスト商品',
          description: 'テスト商品の説明',
          price: 1000,
          imageUrl: '/test.jpg',
          stock: 10,
          category: 'テスト',
        },
        quantity: 1,
      },
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<Cart />)

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    const plusButton = screen.getByText('+').closest('button')
    if (plusButton) {
      fireEvent.click(plusButton)
    }

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('数量を減らすボタンをクリックすると数量が減る', async () => {
    const mockCartItems = [
      {
        productId: '1',
        product: {
          id: '1',
          title: 'テスト商品',
          description: 'テスト商品の説明',
          price: 1000,
          imageUrl: '/test.jpg',
          stock: 10,
          category: 'テスト',
        },
        quantity: 2,
      },
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<Cart />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    const minusButton = screen.getByText('-').closest('button')
    if (minusButton) {
      fireEvent.click(minusButton)
    }

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('削除ボタンをクリックすると商品がカートから削除される', async () => {
    const mockCartItems = [
      {
        productId: '1',
        product: {
          id: '1',
          title: 'テスト商品',
          description: 'テスト商品の説明',
          price: 1000,
          imageUrl: '/test.jpg',
          stock: 10,
          category: 'テスト',
        },
        quantity: 1,
      },
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<Cart />)

    await waitFor(() => {
      expect(screen.getByText('テスト商品')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText('テスト商品')).not.toBeInTheDocument()
      expect(screen.getByText('カートに商品がありません')).toBeInTheDocument()
    })
  })

  it('合計金額が正しく計算される', async () => {
    const mockCartItems = [
      {
        productId: '1',
        product: {
          id: '1',
          title: '商品1',
          description: '説明1',
          price: 1000,
          imageUrl: '/test1.jpg',
          stock: 10,
          category: 'テスト',
        },
        quantity: 2,
      },
      {
        productId: '2',
        product: {
          id: '2',
          title: '商品2',
          description: '説明2',
          price: 2000,
          imageUrl: '/test2.jpg',
          stock: 10,
          category: 'テスト',
        },
        quantity: 1,
      },
    ]

    localStorage.setItem('cart', JSON.stringify(mockCartItems))

    render(<Cart />)

    await waitFor(() => {
      // 小計: 1000 * 2 + 2000 * 1 = 4000
      // 合計金額は複数箇所に表示されるため、getAllByTextを使用
      const totalPrices = screen.getAllByText('¥4,000')
      expect(totalPrices.length).toBeGreaterThan(0)
    })
  })
})


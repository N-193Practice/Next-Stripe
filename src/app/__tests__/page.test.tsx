import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '../page'
import { productService } from '../lib/firestore'
import { Product } from '../types/product'

// Firestoreサービスのモック
jest.mock('../lib/firestore', () => ({
  productService: {
    getAllProducts: jest.fn(),
  },
}))

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

const mockProductService = productService as jest.Mocked<typeof productService>

describe('Home Page', () => {
  // console.errorをモックして、テスト中のエラー出力を抑制
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('ローディング中は読み込み中メッセージを表示する', () => {
    mockProductService.getAllProducts.mockImplementation(
      () => new Promise(() => {}) // 解決しないPromiseでローディング状態を維持
    )

    render(<Home />)
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('商品一覧を表示する', async () => {
    const mockProducts: Product[] = [
      {
        id: '1',
        title: '商品1',
        description: '説明1',
        price: 1000,
        imageUrl: '/image1.jpg',
        category: 'カテゴリ1',
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: '商品2',
        description: '説明2',
        price: 2000,
        imageUrl: '/image2.jpg',
        category: 'カテゴリ2',
        stock: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    mockProductService.getAllProducts.mockResolvedValue(mockProducts)

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('商品一覧')).toBeInTheDocument()
      expect(screen.getByText('商品1')).toBeInTheDocument()
      expect(screen.getByText('商品2')).toBeInTheDocument()
      expect(screen.getByText('説明1')).toBeInTheDocument()
      expect(screen.getByText('説明2')).toBeInTheDocument()
      expect(screen.getByText('¥1,000')).toBeInTheDocument()
      expect(screen.getByText('¥2,000')).toBeInTheDocument()
    })

    // 詳細を見るボタンが表示されているか確認
    const detailButtons = screen.getAllByText('詳細を見る')
    expect(detailButtons.length).toBe(2)
  })

  it('商品が存在しない場合、空のメッセージを表示する', async () => {
    mockProductService.getAllProducts.mockResolvedValue([])

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText('商品がありません')).toBeInTheDocument()
    })
  })

  it('商品取得に失敗した場合、エラーメッセージを表示する', async () => {
    mockProductService.getAllProducts.mockRejectedValue(new Error('取得エラー'))

    render(<Home />)

    await waitFor(() => {
      // エラーメッセージが表示される
      expect(screen.getByText('商品の取得に失敗しました。しばらくしてから再度お試しください。')).toBeInTheDocument()
      // 商品がありませんのメッセージは表示されない
      expect(screen.queryByText('商品がありません')).not.toBeInTheDocument()
    })
  })

  it('カートへのリンクが表示される', async () => {
    mockProductService.getAllProducts.mockResolvedValue([])

    render(<Home />)

    await waitFor(() => {
      const cartLink = screen.getByText('カート')
      expect(cartLink).toBeInTheDocument()
      expect(cartLink.closest('a')).toHaveAttribute('href', '/cart')
    })
  })
})


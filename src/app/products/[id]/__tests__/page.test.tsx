import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import ProductDetail from '../page'
import { productService } from '../../../lib/firestore'
import { Product } from '../../../types/product'

// Next.jsのモック
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}))

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

// Firestoreサービスのモック
jest.mock('../../../lib/firestore', () => ({
  productService: {
    getProductById: jest.fn(),
  },
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockProductService = productService as jest.Mocked<typeof productService>

describe('ProductDetail Page', () => {
  const mockPush = jest.fn()
  const mockProduct: Product = {
    id: '1',
    title: 'テスト商品',
    description: 'テスト商品の説明',
    price: 1000,
    imageUrl: '/test.jpg',
    category: 'テストカテゴリ',
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as ReturnType<typeof useRouter>)
    // alertをモック
    window.alert = jest.fn()
  })

  it('ローディング中は読み込み中メッセージを表示する', () => {
    mockUseParams.mockReturnValue({ id: '1' })
    mockProductService.getProductById.mockImplementation(
      () => new Promise(() => {}) // 解決しないPromiseでローディング状態を維持
    )

    render(<ProductDetail />)
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('商品詳細を表示する', async () => {
    mockUseParams.mockReturnValue({ id: '1' })
    mockProductService.getProductById.mockResolvedValue(mockProduct)

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('テスト商品')).toBeInTheDocument()
      expect(screen.getByText('テスト商品の説明')).toBeInTheDocument()
      expect(screen.getByText('¥1,000')).toBeInTheDocument()
      expect(screen.getByText('在庫数: 10個')).toBeInTheDocument()
      expect(screen.getByText('カテゴリ: テストカテゴリ')).toBeInTheDocument()
    })
  })

  it('商品が見つからない場合、ホームページにリダイレクトする', async () => {
    mockUseParams.mockReturnValue({ id: '999' })
    mockProductService.getProductById.mockResolvedValue(null)

    render(<ProductDetail />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('カートに追加ボタンをクリックすると商品がカートに追加される', async () => {
    mockUseParams.mockReturnValue({ id: '1' })
    mockProductService.getProductById.mockResolvedValue(mockProduct)

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('テスト商品')).toBeInTheDocument()
    })

    const addToCartButton = screen.getByText('カートに追加')
    fireEvent.click(addToCartButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('カートに追加しました')
    })

    // ローカルストレージに商品が追加されているか確認
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    expect(cart).toHaveLength(1)
    expect(cart[0].productId).toBe('1')
    expect(cart[0].quantity).toBe(1)
  })

  it('数量を変更してカートに追加できる', async () => {
    mockUseParams.mockReturnValue({ id: '1' })
    mockProductService.getProductById.mockResolvedValue(mockProduct)

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('テスト商品')).toBeInTheDocument()
    })

    // 数量を3に変更
    const quantitySelect = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(quantitySelect, { target: { value: '3' } })

    const addToCartButton = screen.getByText('カートに追加')
    fireEvent.click(addToCartButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('カートに追加しました')
    })

    // ローカルストレージに数量3で商品が追加されているか確認
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    expect(cart[0].quantity).toBe(3)
  })

  it('既存の商品をカートに追加すると数量が増える', async () => {
    mockUseParams.mockReturnValue({ id: '1' })
    mockProductService.getProductById.mockResolvedValue(mockProduct)

    // 既にカートに商品がある状態
    localStorage.setItem(
      'cart',
      JSON.stringify([
        {
          productId: '1',
          product: mockProduct,
          quantity: 2,
        },
      ])
    )

    render(<ProductDetail />)

    await waitFor(() => {
      expect(screen.getByText('テスト商品')).toBeInTheDocument()
    })

    const addToCartButton = screen.getByText('カートに追加')
    fireEvent.click(addToCartButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('カートに追加しました')
    })

    // 数量が増えているか確認（2 + 1 = 3）
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    expect(cart[0].quantity).toBe(3)
  })

  it('今すぐ購入ボタンが表示される', async () => {
    mockUseParams.mockReturnValue({ id: '1' })
    mockProductService.getProductById.mockResolvedValue(mockProduct)

    render(<ProductDetail />)

    await waitFor(() => {
      const buyNowLink = screen.getByText('今すぐ購入')
      expect(buyNowLink).toBeInTheDocument()
      expect(buyNowLink.closest('a')).toHaveAttribute('href', '/cart')
    })
  })

  it('商品一覧に戻るリンクが表示される', async () => {
    mockUseParams.mockReturnValue({ id: '1' })
    mockProductService.getProductById.mockResolvedValue(mockProduct)

    render(<ProductDetail />)

    await waitFor(() => {
      const backLink = screen.getByText('商品一覧に戻る')
      expect(backLink).toBeInTheDocument()
      expect(backLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  it('在庫数に応じて数量選択の最大値が制限される', async () => {
    const lowStockProduct: Product = {
      ...mockProduct,
      stock: 3,
    }

    mockUseParams.mockReturnValue({ id: '1' })
    mockProductService.getProductById.mockResolvedValue(lowStockProduct)

    render(<ProductDetail />)

    await waitFor(() => {
      const quantitySelect = screen.getByRole('combobox') as HTMLSelectElement
      // 在庫数が3なので、選択肢は1, 2, 3のみ
      expect(quantitySelect.options.length).toBe(3)
      expect(quantitySelect.options[0].value).toBe('1')
      expect(quantitySelect.options[2].value).toBe('3')
    })
  })
})


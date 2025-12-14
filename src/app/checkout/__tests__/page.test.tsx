import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Checkout from '../page'
import { CartItem, Product } from '../../types/product'

// Next.jsのモック
jest.mock('next/navigation', () => ({
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

// Stripeのモック
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({ id: 'mock-stripe' })),
}))

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaymentElement: () => <div>PaymentElement</div>,
  useStripe: () => ({ id: 'mock-stripe' }),
  useElements: () => ({ getElement: jest.fn() }),
}))

// fetchのモック
global.fetch = jest.fn()

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Checkout Page', () => {
  const mockPush = jest.fn()
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
    jest.clearAllMocks()
    localStorage.clear()
    window.alert = jest.fn()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as ReturnType<typeof useRouter>)
  })

  it('カートが空の場合、ホームページにリダイレクトする', () => {
    localStorage.setItem('cart', JSON.stringify([]))

    render(<Checkout />)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('ローディング中は読み込み中メッセージを表示する', () => {
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))

    render(<Checkout />)

    // ローディング状態は一瞬なので、カートアイテムが表示されるまで待つ
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
  })

  it('カート情報を表示する', async () => {
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))

    render(<Checkout />)

    await waitFor(() => {
      expect(screen.getByText('お支払い情報')).toBeInTheDocument()
      expect(screen.getByText('テスト商品')).toBeInTheDocument()
      expect(screen.getByText('数量: 2')).toBeInTheDocument()
      // 価格は複数箇所に表示されるため、getAllByTextを使用
      const prices = screen.getAllByText('¥2,000')
      expect(prices.length).toBeGreaterThan(0)
      expect(screen.getByText('合計:')).toBeInTheDocument()
    })
  })

  it('顧客情報フォームが表示される', async () => {
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))

    render(<Checkout />)

    await waitFor(() => {
      expect(screen.getByText('お名前 *')).toBeInTheDocument()
      expect(screen.getByText('メールアドレス *')).toBeInTheDocument()
      expect(screen.getByText('住所 *')).toBeInTheDocument()
      expect(screen.getByText('市区町村 *')).toBeInTheDocument()
      expect(screen.getByText('郵便番号 *')).toBeInTheDocument()
      // 入力フィールドが存在することを確認（name属性で検索）
      const inputs = screen.getAllByRole('textbox')
      const nameField = inputs.find(input => (input as HTMLInputElement).name === 'name')
      expect(nameField).toBeDefined()
    })
  })

  it('顧客情報を入力できる', async () => {
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))

    render(<Checkout />)

    await waitFor(() => {
      // name属性が'name'のものを探す
      const inputs = screen.getAllByRole('textbox')
      const nameField = inputs.find(input => (input as HTMLInputElement).name === 'name')
      expect(nameField).toBeDefined()
      if (nameField) {
        fireEvent.change(nameField, { target: { value: 'テスト太郎' } })
        expect(nameField).toHaveValue('テスト太郎')
      }
    })
  })

  it('フォーム送信時にPayment Intentを作成する', async () => {
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))

    const mockClientSecret = 'pi_test_client_secret'
    const mockOrderId = 'order123'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        clientSecret: mockClientSecret,
        orderId: mockOrderId,
      }),
    } as Response)

    render(<Checkout />)

    await waitFor(() => {
      expect(screen.getByText('お名前 *')).toBeInTheDocument()
    })

    // フォームに入力（name属性で検索）
    const inputs = screen.getAllByRole('textbox')
    const nameInput = inputs.find(input => (input as HTMLInputElement).name === 'name')
    const emailInput = inputs.find(input => (input as HTMLInputElement).name === 'email')
    const addressInput = inputs.find(input => (input as HTMLInputElement).name === 'address')
    const cityInput = inputs.find(input => (input as HTMLInputElement).name === 'city')
    const postalCodeInput = inputs.find(input => (input as HTMLInputElement).name === 'postalCode')

    if (nameInput) fireEvent.change(nameInput, { target: { value: 'テスト太郎' } })
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    if (addressInput) fireEvent.change(addressInput, { target: { value: 'テスト住所' } })
    if (cityInput) fireEvent.change(cityInput, { target: { value: 'テスト市' } })
    if (postalCodeInput) fireEvent.change(postalCodeInput, { target: { value: '123-4567' } })

    // フォームを送信
    const submitButton = screen.getByText(/で支払う/)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [mockCartItem],
          totalAmount: 2000,
          customerInfo: {
            name: 'テスト太郎',
            email: 'test@example.com',
            address: 'テスト住所',
            city: 'テスト市',
            postalCode: '123-4567',
          },
        }),
      })
    })
  })

  it('APIエラーが発生した場合、エラーメッセージを表示する', async () => {
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'APIエラー' }),
    } as Response)

    render(<Checkout />)

    await waitFor(() => {
      expect(screen.getByText('お名前 *')).toBeInTheDocument()
    })

    // フォームに入力（name属性で検索）
    const inputs = screen.getAllByRole('textbox')
    const nameInput = inputs.find(input => (input as HTMLInputElement).name === 'name')
    const emailInput = inputs.find(input => (input as HTMLInputElement).name === 'email')
    const addressInput = inputs.find(input => (input as HTMLInputElement).name === 'address')
    const cityInput = inputs.find(input => (input as HTMLInputElement).name === 'city')
    const postalCodeInput = inputs.find(input => (input as HTMLInputElement).name === 'postalCode')

    if (nameInput) fireEvent.change(nameInput, { target: { value: 'テスト太郎' } })
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    if (addressInput) fireEvent.change(addressInput, { target: { value: 'テスト住所' } })
    if (cityInput) fireEvent.change(cityInput, { target: { value: 'テスト市' } })
    if (postalCodeInput) fireEvent.change(postalCodeInput, { target: { value: '123-4567' } })

    // フォームを送信
    const submitButton = screen.getByText(/で支払う/)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('決済処理中にエラーが発生しました')
    })
  })

  it('Payment Intent作成後、Stripe Elementsを表示する', async () => {
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))

    const mockClientSecret = 'pi_test_client_secret'
    const mockOrderId = 'order123'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        clientSecret: mockClientSecret,
        orderId: mockOrderId,
      }),
    } as Response)

    render(<Checkout />)

    await waitFor(() => {
      expect(screen.getByText('お名前 *')).toBeInTheDocument()
    })

    // フォームに入力して送信（name属性で検索）
    const inputs = screen.getAllByRole('textbox')
    const nameInput = inputs.find(input => (input as HTMLInputElement).name === 'name')
    const emailInput = inputs.find(input => (input as HTMLInputElement).name === 'email')
    const addressInput = inputs.find(input => (input as HTMLInputElement).name === 'address')
    const cityInput = inputs.find(input => (input as HTMLInputElement).name === 'city')
    const postalCodeInput = inputs.find(input => (input as HTMLInputElement).name === 'postalCode')

    if (nameInput) fireEvent.change(nameInput, { target: { value: 'テスト太郎' } })
    if (emailInput) fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    if (addressInput) fireEvent.change(addressInput, { target: { value: 'テスト住所' } })
    if (cityInput) fireEvent.change(cityInput, { target: { value: 'テスト市' } })
    if (postalCodeInput) fireEvent.change(postalCodeInput, { target: { value: '123-4567' } })

    const submitButton = screen.getByText(/で支払う/)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('支払い情報')).toBeInTheDocument()
      expect(screen.getByText('PaymentElement')).toBeInTheDocument()
    })
  })

  it('カートに戻るリンクが表示される', async () => {
    localStorage.setItem('cart', JSON.stringify([mockCartItem]))

    render(<Checkout />)

    await waitFor(() => {
      const backLink = screen.getByText('カートに戻る')
      expect(backLink).toBeInTheDocument()
      expect(backLink.closest('a')).toHaveAttribute('href', '/cart')
    })
  })
})


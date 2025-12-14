import { productService, orderService } from '../firestore'
import { Product, Order, CartItem } from '../../types/product'

// Firestoreの関数をモック化
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
}))

// Firebase clientのモック
jest.mock('../firebase/client', () => ({
  db: {},
}))

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore'
import type {
  CollectionReference,
  DocumentReference,
  Query,
  QuerySnapshot,
  QueryDocumentSnapshot,
  DocumentSnapshot,
} from 'firebase/firestore'

// 型アサーション用のヘルパー
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>
const mockCollection = collection as jest.MockedFunction<typeof collection>
const mockDoc = doc as jest.MockedFunction<typeof doc>
const mockQuery = query as jest.MockedFunction<typeof query>
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>

// モック用の型定義
const createMockCollectionRef = (): CollectionReference => ({} as CollectionReference)
const createMockDocRef = (): DocumentReference => ({} as DocumentReference)
const createMockQuery = (): Query => ({} as Query)

// QueryDocumentSnapshotのモックを作成するヘルパー関数
const createMockQueryDocumentSnapshot = (
  id: string,
  data: () => unknown
): QueryDocumentSnapshot => {
  const snapshot = {
    id,
    data,
    exists(this: QueryDocumentSnapshot): this is QueryDocumentSnapshot {
      return true
    },
    metadata: {
      fromCache: false,
      hasPendingWrites: false,
      isEqual: jest.fn(),
    },
    ref: createMockDocRef(),
    get: jest.fn(),
    toJSON: jest.fn(),
  }
  return snapshot as QueryDocumentSnapshot
}

// QuerySnapshotのモックを作成するヘルパー関数
const createMockQuerySnapshot = (docs: Array<{ id: string; data: () => unknown }>): QuerySnapshot => {
  const queryDocs = docs.map(doc => createMockQueryDocumentSnapshot(doc.id, doc.data))
  return {
    docs: queryDocs,
    metadata: {
      fromCache: false,
      hasPendingWrites: false,
      isEqual: jest.fn(),
    },
    query: createMockQuery(),
    size: docs.length,
    empty: docs.length === 0,
    forEach: jest.fn(),
    docChanges: jest.fn(() => []),
    toJSON: jest.fn(),
  } as QuerySnapshot
}

// DocumentSnapshotのモックを作成するヘルパー関数
const createMockDocumentSnapshot = (
  id: string,
  exists: boolean,
  data: () => unknown
): DocumentSnapshot => {
  const snapshot = {
    id,
    exists(this: DocumentSnapshot): this is DocumentSnapshot {
      return exists
    },
    data,
    metadata: {
      fromCache: false,
      hasPendingWrites: false,
      isEqual: jest.fn(),
    },
    ref: createMockDocRef(),
    get: jest.fn(),
    toJSON: jest.fn(),
  }
  return snapshot as DocumentSnapshot
}

describe('Firestore Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('productService', () => {
    describe('getAllProducts', () => {
      it('全商品を取得できる', async () => {
        const mockProducts = [
          {
            id: '1',
            data: () => ({
              title: '商品1',
              description: '説明1',
              price: 1000,
              imageUrl: '/image1.jpg',
              category: 'カテゴリ1',
              stock: 10,
              createdAt: { toDate: () => new Date('2024-01-01') },
              updatedAt: { toDate: () => new Date('2024-01-01') },
            }),
          },
          {
            id: '2',
            data: () => ({
              title: '商品2',
              description: '説明2',
              price: 2000,
              imageUrl: '/image2.jpg',
              category: 'カテゴリ2',
              stock: 20,
              createdAt: { toDate: () => new Date('2024-01-02') },
              updatedAt: { toDate: () => new Date('2024-01-02') },
            }),
          },
        ]

        const mockSnapshot = createMockQuerySnapshot(mockProducts)

        mockCollection.mockReturnValue(createMockCollectionRef())
        mockOrderBy.mockReturnValue({} as ReturnType<typeof orderBy>)
        mockQuery.mockReturnValue(createMockQuery())
        mockGetDocs.mockResolvedValue(mockSnapshot)

        const result = await productService.getAllProducts()

        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('1')
        expect(result[0].title).toBe('商品1')
        expect(result[0].price).toBe(1000)
        expect(result[1].id).toBe('2')
        expect(result[1].title).toBe('商品2')
        expect(result[1].price).toBe(2000)
        expect(mockCollection).toHaveBeenCalledWith({}, 'products')
        expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc')
      })

      it('商品が存在しない場合、空の配列を返す', async () => {
        const mockSnapshot = createMockQuerySnapshot([])

        mockCollection.mockReturnValue(createMockCollectionRef())
        mockOrderBy.mockReturnValue({} as ReturnType<typeof orderBy>)
        mockQuery.mockReturnValue(createMockQuery())
        mockGetDocs.mockResolvedValue(mockSnapshot)

        const result = await productService.getAllProducts()

        expect(result).toHaveLength(0)
        expect(Array.isArray(result)).toBe(true)
      })
    })

    describe('getProductById', () => {
      it('IDで商品を取得できる', async () => {
        const mockProduct = createMockDocumentSnapshot(
          '1',
          true,
          () => ({
            title: '商品1',
            description: '説明1',
            price: 1000,
            imageUrl: '/image1.jpg',
            category: 'カテゴリ1',
            stock: 10,
            createdAt: { toDate: () => new Date('2024-01-01') },
            updatedAt: { toDate: () => new Date('2024-01-01') },
          })
        )

        mockDoc.mockReturnValue(createMockDocRef())
        mockGetDoc.mockResolvedValue(mockProduct)

        const result = await productService.getProductById('1')

        expect(result).not.toBeNull()
        expect(result?.id).toBe('1')
        expect(result?.title).toBe('商品1')
        expect(result?.price).toBe(1000)
        expect(mockDoc).toHaveBeenCalledWith({}, 'products', '1')
      })

      it('存在しないIDの場合、nullを返す', async () => {
        const mockProduct = createMockDocumentSnapshot('999', false, () => ({}))

        mockDoc.mockReturnValue(createMockDocRef())
        mockGetDoc.mockResolvedValue(mockProduct)

        const result = await productService.getProductById('999')

        expect(result).toBeNull()
      })
    })

    describe('addProduct', () => {
      it('商品を追加できる', async () => {
        const newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
          title: '新商品',
          description: '新商品の説明',
          price: 3000,
          imageUrl: '/new-image.jpg',
          category: '新カテゴリ',
          stock: 30,
        }

        const mockDocRef = {
          id: 'new-product-id',
        }

        mockCollection.mockReturnValue(createMockCollectionRef())
        mockAddDoc.mockResolvedValue(mockDocRef as DocumentReference)

        const result = await productService.addProduct(newProduct)

        expect(result).toBe('new-product-id')
        expect(mockCollection).toHaveBeenCalledWith({}, 'products')
        expect(mockAddDoc).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            title: '新商品',
            description: '新商品の説明',
            price: 3000,
            imageUrl: '/new-image.jpg',
            category: '新カテゴリ',
            stock: 30,
          })
        )
      })
    })

    describe('updateProduct', () => {
      it('商品を更新できる', async () => {
        const updates: Partial<Product> = {
          title: '更新された商品',
          price: 1500,
        }

        mockDoc.mockReturnValue(createMockDocRef())
        mockUpdateDoc.mockResolvedValue(undefined)

        await productService.updateProduct('1', updates)

        expect(mockDoc).toHaveBeenCalledWith({}, 'products', '1')
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            title: '更新された商品',
            price: 1500,
          })
        )
      })
    })

    describe('deleteProduct', () => {
      it('商品を削除できる', async () => {
        mockDoc.mockReturnValue(createMockDocRef())
        mockDeleteDoc.mockResolvedValue(undefined)

        await productService.deleteProduct('1')

        expect(mockDoc).toHaveBeenCalledWith({}, 'products', '1')
        expect(mockDeleteDoc).toHaveBeenCalledWith({})
      })
    })
  })

  describe('orderService', () => {
    describe('createOrder', () => {
      it('注文を作成できる', async () => {
        const mockProduct: Product = {
          id: '1',
          title: '商品1',
          description: '説明1',
          price: 1000,
          imageUrl: '/image1.jpg',
          category: 'カテゴリ1',
          stock: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const mockCartItem: CartItem = {
          productId: '1',
          product: mockProduct,
          quantity: 2,
        }

        const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
          userId: 'user123',
          items: [mockCartItem],
          totalAmount: 2000,
          status: 'pending',
        }

        const mockDocRef = {
          id: 'new-order-id',
        }

        mockCollection.mockReturnValue(createMockCollectionRef())
        mockAddDoc.mockResolvedValue(mockDocRef as DocumentReference)

        const result = await orderService.createOrder(newOrder)

        expect(result).toBe('new-order-id')
        expect(mockCollection).toHaveBeenCalledWith({}, 'orders')
        expect(mockAddDoc).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            userId: 'user123',
            items: [mockCartItem],
            totalAmount: 2000,
            status: 'pending',
          })
        )
      })
    })

    describe('getOrderById', () => {
      it('IDで注文を取得できる', async () => {
        const mockProduct: Product = {
          id: '1',
          title: '商品1',
          description: '説明1',
          price: 1000,
          imageUrl: '/image1.jpg',
          category: 'カテゴリ1',
          stock: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const mockCartItem: CartItem = {
          productId: '1',
          product: mockProduct,
          quantity: 2,
        }

        const mockOrder = createMockDocumentSnapshot(
          'order1',
          true,
          () => ({
            userId: 'user123',
            items: [mockCartItem],
            totalAmount: 2000,
            status: 'paid',
            stripePaymentIntentId: 'pi_test123',
            createdAt: { toDate: () => new Date('2024-01-01') },
            updatedAt: { toDate: () => new Date('2024-01-01') },
          })
        )

        mockDoc.mockReturnValue(createMockDocRef())
        mockGetDoc.mockResolvedValue(mockOrder)

        const result = await orderService.getOrderById('order1')

        expect(result).not.toBeNull()
        expect(result?.id).toBe('order1')
        expect(result?.userId).toBe('user123')
        expect(result?.totalAmount).toBe(2000)
        expect(result?.status).toBe('paid')
        expect(result?.items).toHaveLength(1)
        expect(mockDoc).toHaveBeenCalledWith({}, 'orders', 'order1')
      })

      it('存在しないIDの場合、nullを返す', async () => {
        const mockOrder = createMockDocumentSnapshot('order999', false, () => ({}))

        mockDoc.mockReturnValue(createMockDocRef())
        mockGetDoc.mockResolvedValue(mockOrder)

        const result = await orderService.getOrderById('order999')

        expect(result).toBeNull()
      })
    })

    describe('updateOrder', () => {
      it('注文を更新できる', async () => {
        const updates: Partial<Order> = {
          status: 'shipped',
        }

        mockDoc.mockReturnValue(createMockDocRef())
        mockUpdateDoc.mockResolvedValue(undefined)

        await orderService.updateOrder('order1', updates)

        expect(mockDoc).toHaveBeenCalledWith({}, 'orders', 'order1')
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            status: 'shipped',
          })
        )
      })

      it('注文ステータスをpendingからpaidに更新できる', async () => {
        const updates: Partial<Order> = {
          status: 'paid',
          stripePaymentIntentId: 'pi_test123',
        }

        mockDoc.mockReturnValue(createMockDocRef())
        mockUpdateDoc.mockResolvedValue(undefined)

        await orderService.updateOrder('order1', updates)

        expect(mockUpdateDoc).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            status: 'paid',
            stripePaymentIntentId: 'pi_test123',
          })
        )
      })
    })
  })
})


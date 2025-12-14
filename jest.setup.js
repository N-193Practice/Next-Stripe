// Jestのセットアップファイル
// @testing-library/jest-domのマッチャーをインポート
import '@testing-library/jest-dom'


// テストでは実際のlocalStorageを使用する

// window.matchMediaのモック（Tailwind CSSなどで使用）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// fetchのモック（Stripeなどで使用）
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn()
}




import { Component, type ErrorInfo, type ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("خطای پیش‌بینی‌نشده در رابط کاربری.", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          dir="rtl"
          className="flex min-h-screen items-center justify-center bg-[#0D0F0D] px-6 text-center text-white"
        >
          <div>
            <h1 className="text-3xl font-black">خطایی رخ داد</h1>
            <p className="mt-3 text-white/60">
              لطفاً صفحه را دوباره بارگذاری کنید. اگر مشکل ادامه داشت، با پشتیبانی تماس بگیرید.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-[#D9E600] px-6 py-3 font-bold text-[#0D0F0D]"
            >
              بارگذاری دوباره
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

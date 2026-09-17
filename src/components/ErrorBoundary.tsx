'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-[#E2D7CB]">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="font-serif text-xl font-bold text-[#2B1D19] mb-2">
                Algo salió mal
              </h2>
              <p className="text-sm text-[#7A6658] mb-4">
                Ocurrió un error inesperado. Intenta recargar la página.
              </p>
              <p className="text-xs text-[#A39E93] font-mono mb-6 bg-[#FAF6EF] p-3 rounded-lg text-left break-all">
                {this.state.error?.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#A07835] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#8C6239] transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}

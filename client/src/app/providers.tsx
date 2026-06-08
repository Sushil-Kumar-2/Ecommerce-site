import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { Toaster } from '@/components/ui/sonner'
import { store } from '@/store'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </Provider>
  )
}

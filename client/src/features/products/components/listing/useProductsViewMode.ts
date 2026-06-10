import { useEffect, useState } from 'react'

type ViewMode = 'grid' | 'list'

const STORAGE_KEY = 'products:viewMode'

export function useProductsViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>('grid')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as ViewMode | null
      if (stored === 'grid' || stored === 'list') {
        setMode(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  const updateMode = (next: ViewMode) => {
    setMode(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  return [mode, updateMode]
}


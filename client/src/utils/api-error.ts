import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isFetchBaseQueryError(error)) {
    if (typeof error.data === 'string') {
      return error.data
    }

    if (
      typeof error.data === 'object' &&
      error.data !== null &&
      'message' in error.data
    ) {
      const message = (error.data as { message: unknown }).message

      if (typeof message === 'string') {
        return message
      }

      if (Array.isArray(message)) {
        return message.join(', ')
      }
    }

    if (error.status === 'FETCH_ERROR') {
      return 'Network error. Please check your connection.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

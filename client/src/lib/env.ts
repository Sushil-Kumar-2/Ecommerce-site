const DEFAULT_API_URL = 'http://localhost:3000'

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? DEFAULT_API_URL,
} as const

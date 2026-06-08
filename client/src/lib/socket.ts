import { io, type Socket } from 'socket.io-client'

import { env } from '@/lib/env'

export function createSocket(namespace: string, token?: string): Socket {
  return io(`${env.socketUrl}${namespace}`, {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    autoConnect: false,
  })
}

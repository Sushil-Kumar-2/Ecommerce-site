import type { JwtPayload, UserRole } from '@/types/auth.types'

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  return atob(`${normalized}${padding}`)
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')

  if (parts.length !== 3) {
    return null
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]!)) as JwtPayload & {
      exp?: number
    }

    if (!payload.sub || !payload.email || !payload.role) {
      return null
    }

    if (isTokenExpired(token)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const parts = token.split('.')

  if (parts.length !== 3) {
    return true
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]!)) as { exp?: number }

    if (!payload.exp) {
      return false
    }

    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function mapJwtPayloadToAuthUser(payload: JwtPayload) {
  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
  }
}

export function isUserRole(value: string): value is UserRole {
  return value === 'user' || value === 'merchant' || value === 'admin'
}

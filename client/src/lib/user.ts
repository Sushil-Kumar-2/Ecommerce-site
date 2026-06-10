export function getInitials(nameOrEmail?: string | null): string {
  const trimmed = (nameOrEmail ?? '').trim()
  if (!trimmed) return '?'

  if (trimmed.includes('@')) {
    return trimmed.slice(0, 2).toUpperCase()
  }

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return trimmed.slice(0, 2).toUpperCase()
}

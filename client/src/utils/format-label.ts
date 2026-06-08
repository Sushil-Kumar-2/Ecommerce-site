export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function humanizeStatus(value: string): string {
  return humanizeEnum(value)
}

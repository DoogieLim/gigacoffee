export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(price)
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
}

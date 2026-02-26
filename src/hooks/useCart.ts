"use client"

import { useCartStore } from "@/stores/cartStore"

export function useCart() {
  return useCartStore()
}

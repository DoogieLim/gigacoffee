import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "@/types/order.types"

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.product_id === newItem.product_id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === newItem.product_id
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i.product_id === productId ? { ...i, quantity } : i)),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const optionTotal = item.options.reduce((s, o) => s + o.price_delta, 0)
          return total + (item.price + optionTotal) * item.quantity
        }, 0)
      },
    }),
    { name: "cart-storage" }
  )
)

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, DeliveryType, DeliveryAddress } from "@/types/order.types"

function makeItemKey(item: Omit<CartItem, "itemKey">): string {
  const optPart = item.options
    .map((o) => `${o.name}:${o.choice}`)
    .sort()
    .join("|")
  return `${item.product_id}__${optPart}`
}

interface CartStore {
  items: CartItem[]
  deliveryType: DeliveryType
  deliveryAddress: DeliveryAddress | null
  currentStoreId: string | null
  addItem: (item: Omit<CartItem, "itemKey">) => void
  removeItem: (itemKey: string) => void
  updateQuantity: (itemKey: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  setDeliveryType: (type: DeliveryType) => void
  setDeliveryAddress: (address: DeliveryAddress | null) => void
  setCurrentStore: (storeId: string) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: "pickup",
      deliveryAddress: null,
      currentStoreId: null,

      addItem: (newItem) => {
        const itemKey = makeItemKey(newItem)
        set((state) => {
          const existing = state.items.find((i) => i.itemKey === itemKey)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.itemKey === itemKey
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...newItem, itemKey }] }
        })
      },

      removeItem: (itemKey) => {
        set((state) => ({ items: state.items.filter((i) => i.itemKey !== itemKey) }))
      },

      updateQuantity: (itemKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemKey)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i.itemKey === itemKey ? { ...i, quantity } : i)),
        }))
      },

      clearCart: () => set({ items: [], deliveryAddress: null }),

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const optionTotal = item.options.reduce((s, o) => s + o.price_delta, 0)
          return total + (item.price + optionTotal) * item.quantity
        }, 0)
      },

      setDeliveryType: (type) => {
        set({ deliveryType: type, deliveryAddress: type === "pickup" ? null : get().deliveryAddress })
      },

      setDeliveryAddress: (address) => {
        set({ deliveryAddress: address })
      },

      setCurrentStore: (storeId) => {
        // 매장 변경 시 장바구니 초기화 (다른 매장 상품 혼합 방지)
        set({ currentStoreId: storeId, items: [], deliveryAddress: null })
      },
    }),
    { name: "cart-storage" }
  )
)

import { create } from "zustand"

interface Toast {
  id: string
  message: string
  variant?: "success" | "error" | "info" | "warning"
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, variant?: Toast["variant"]) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, variant = "info") => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

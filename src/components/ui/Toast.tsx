"use client"

import { useToastStore } from "@/stores/toastStore"
import { cn } from "@/lib/utils/cn"

const variantStyles = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
  warning: "bg-yellow-600",
}

export function ToastContainer() {
  const { toasts } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg",
            "animate-in slide-in-from-right-2 duration-200",
            variantStyles[toast.variant ?? "info"]
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

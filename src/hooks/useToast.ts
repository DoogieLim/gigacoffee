"use client"

import { useToastStore } from "@/stores/toastStore"

export function useToast() {
  const { addToast } = useToastStore()
  return {
    toast: addToast,
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    info: (msg: string) => addToast(msg, "info"),
    warning: (msg: string) => addToast(msg, "warning"),
  }
}

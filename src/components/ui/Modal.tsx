"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils/cn"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "w-full rounded-2xl bg-white p-0 shadow-xl",
        "backdrop:bg-black/50",
        sizeStyles[size]
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        <button
          onClick={onClose}
          className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  )
}

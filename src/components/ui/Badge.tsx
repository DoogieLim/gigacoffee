import { cn } from "@/lib/utils/cn"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info" | "tech"
  className?: string
}

const variantStyles = {
  default:  "bg-cream-dark text-ink-secondary",
  success:  "bg-green-100 text-green-800",
  warning:  "bg-amber-100 text-amber-800",
  danger:   "bg-red-100 text-red-800",
  info:     "bg-brand-light text-brand",
  tech:     "bg-tech-light text-tech",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-medium uppercase tracking-widest",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

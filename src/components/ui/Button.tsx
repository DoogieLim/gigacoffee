import { cn } from "@/lib/utils/cn"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "coffee"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

const variantStyles = {
  primary:   "bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand",
  secondary: "bg-cream-dark text-ink hover:bg-border-warm focus-visible:ring-ink-muted",
  outline:   "border border-brand text-brand hover:bg-brand-light focus-visible:ring-brand",
  ghost:     "text-ink-secondary hover:bg-cream-dark focus-visible:ring-ink-muted",
  danger:    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
  coffee:    "bg-coffee text-white hover:bg-coffee-hover focus-visible:ring-coffee",
}

const sizeStyles = {
  sm: "h-8 px-4 text-xs tracking-wide",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-8 text-base tracking-wide",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-none font-medium uppercase tracking-widest transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

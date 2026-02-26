import { cn } from "@/lib/utils/cn"
import { type InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-widest text-ink-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full border border-border-warm bg-white px-3 py-2.5 text-sm text-ink rounded-none",
            "placeholder:text-ink-muted",
            "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15",
            "disabled:bg-cream-dark disabled:text-ink-muted",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="text-xs text-ink-muted">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"

import { cn } from "@/lib/utils/cn"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("border border-border-warm bg-white shadow-[0_2px_12px_rgba(24,23,14,0.06)]", className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("border-b border-border-light px-6 py-4", className)}>{children}</div>
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={cn("border-t border-border-light px-6 py-4", className)}>{children}</div>
}

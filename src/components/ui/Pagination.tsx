"use client"

import { Button } from "./Button"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    return start + i
  })

  return (
    <nav className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        이전
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "primary" : "ghost"}
          size="sm"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        다음
      </Button>
    </nav>
  )
}

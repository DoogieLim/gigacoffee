"use client"

import { useState } from "react"

export function usePagination(totalItems: number, itemsPerPage = 20) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const offset = (page - 1) * itemsPerPage

  return { page, totalPages, offset, setPage }
}

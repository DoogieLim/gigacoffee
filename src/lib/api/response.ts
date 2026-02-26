import { NextResponse } from "next/server"

export function apiSuccess(data: unknown, status = 200): Response {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400): Response {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function apiPaginated(
  data: unknown[],
  total: number,
  page: number,
  limit: number
): Response {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })
}

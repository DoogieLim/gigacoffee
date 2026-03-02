/**
 * API 응답 헬퍼
 *
 * 모든 REST API 응답을 일관된 포맷으로 표준화한다.
 *
 * ## 응답 포맷
 * - 성공: `{ success: true, data: T }`
 * - 에러: `{ success: false, error: string }`
 * - 페이지네이션: `{ success: true, data: T[], pagination: { total, page, limit, pages } }`
 *
 * ## 설계 이유
 * `success` 필드를 명시함으로써 클라이언트가 HTTP 상태 코드와 무관하게
 * JSON만 보고도 성공/실패를 판단할 수 있다.
 * 특히 PortOne 결제 웹훅 등 HTTP 상태를 신뢰하기 어려운 환경에서 유용하다.
 */
import { NextResponse } from "next/server"

/**
 * 성공 응답 생성
 * @param data 응답 데이터 (배열 또는 단일 객체)
 * @param status HTTP 상태 코드 (기본: 200, 생성 시: 201)
 */
export function apiSuccess(data: unknown, status = 200): Response {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * 에러 응답 생성
 *
 * `requireAuth` / `requireRole`에서는 이 함수의 반환값을 throw하여
 * Route Handler의 catch 블록에서 바로 return할 수 있도록 한다.
 *
 * @param message 사용자에게 표시될 에러 메시지 (한국어)
 * @param status HTTP 상태 코드 (기본: 400)
 */
export function apiError(message: string, status = 400): Response {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * 페이지네이션 응답 생성
 *
 * `pages` 필드는 클라이언트가 별도 계산 없이 총 페이지 수를 알 수 있도록 제공.
 *
 * @param data 현재 페이지 데이터
 * @param total 전체 레코드 수 (페이지네이션 UI 렌더링에 사용)
 * @param page 현재 페이지 번호 (1-indexed)
 * @param limit 페이지당 항목 수
 */
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

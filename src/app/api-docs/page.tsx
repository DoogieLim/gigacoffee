/**
 * /api-docs — Swagger UI 페이지
 *
 * GigaCoffee REST API 인터랙티브 문서.
 * 스펙 JSON은 /api/swagger 엔드포인트에서 로드한다.
 *
 * 접근: http://localhost:3000/api-docs (개발) | https://gigacoffee.vercel.app/api-docs (프로덕션)
 *
 * swagger-ui-react는 브라우저 전용 패키지이므로 "use client" + dynamic import 필수.
 * (SSR 시 document is not defined 오류 발생)
 */
"use client"

import dynamic from "next/dynamic"
import "swagger-ui-react/swagger-ui.css"

// SSR 비활성화: swagger-ui-react가 브라우저 DOM API를 직접 사용하기 때문
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false })

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* swagger-ui 기본 스타일의 폰트/레이아웃이 Next.js globals.css와 충돌할 수 있으므로
          독립된 <main> 컨테이너 안에서만 렌더링 */}
      <SwaggerUI
        url="/api/swagger"
        // 요청 실행 시 인증 쿠키를 자동으로 포함 (Supabase 세션)
        requestInterceptor={(req) => {
          req.credentials = "include"
          return req
        }}
        // 모든 태그 그룹을 펼친 상태로 시작
        defaultModelsExpandDepth={-1}
        docExpansion="list"
        filter
        deepLinking
      />
    </main>
  )
}

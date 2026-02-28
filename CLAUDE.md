# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 언어 규칙

사용자와의 모든 대화는 항상 한글로 진행한다.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

테스트 러너는 아직 설정되어 있지 않습니다. 필요 시 Vitest 또는 Jest를 추가하세요.

## 아키텍처

**Next.js 16 App Router** 기반 프로젝트로, TypeScript와 Tailwind CSS v4를 사용합니다.

### 폴더 구조

```
src/
├── app/
│   ├── (auth)/           # 인증 페이지 그룹 (로그인, 회원가입, 비밀번호 찾기)
│   ├── (main)/           # 사용자 사이트 - 웹+모바일 반응형
│   ├── (admin)/          # 관리자 - 웹 전용 (min-width: 1024px)
│   └── api/              # API 라우트
├── components/
│   ├── ui/               # 공통 UI: Button, Input, Select, Modal, Badge, Card, Spinner, Toast, Pagination
│   ├── layout/           # Header, Footer, MobileBottomNav, AdminSidebar
│   ├── auth/             # LoginForm, RegisterForm, SocialLoginButtons
│   ├── menu/             # ProductCard, ProductGrid, CategoryFilter
│   ├── order/            # CartItem, CartSummary
│   ├── admin/            # StatsCard, SalesChart, InventoryTable, LowStockAlert, OrderTable
│   └── notifications/    # NotificationForm
├── lib/
│   ├── auth/             # 인증 추상화 레이어 (핵심: 교체 가능한 설계)
│   │   ├── types.ts      # AuthProvider 인터페이스
│   │   ├── index.ts      # 현재 provider export (교체 시 이 파일만 변경)
│   │   └── providers/supabase.ts
│   ├── db/               # 데이터 접근 추상화 레이어 (Repository 패턴)
│   │   ├── index.ts      # Repository 인스턴스 export (DB 교체 시 이 파일만 변경)
│   │   ├── repositories/ # 인터페이스 정의 (product, order, inventory, board, member, notification, role, payment)
│   │   └── supabase/     # Supabase 구현체 (DB 교체 시 이 디렉토리 대체)
│   ├── supabase/         # client.ts, server.ts, middleware.ts
│   ├── portone/          # client.ts, server.ts, types.ts
│   ├── notifications/    # kakao.ts, fcm.ts, sms.ts, dispatcher.ts
│   ├── utils/            # cn.ts, format.ts, validation.ts
│   └── constants/        # routes.ts, payment.ts, roles.ts
├── hooks/                # useAuth, useCart, useToast, usePagination
├── stores/               # cartStore (zustand + persist), toastStore
├── actions/              # Server Actions: auth, order, product, board, inventory, notification
├── types/                # database.types, auth, product, order, board, inventory, notification
└── middleware.ts         # 인증 미들웨어 (관리자 라우트 보호)
```

### 주요 컨벤션

- 새 라우트는 `src/app/` 하위에 파일 시스템 라우터 방식(폴더 + `page.tsx`)으로 추가합니다.
- 서버 컴포넌트가 기본값이며, 브라우저 API나 React 훅이 필요한 경우에만 `"use client"`를 추가합니다.
- 공유 UI 컴포넌트는 `src/components/`에 위치시킵니다.
- 경로 별칭 `@/*`는 `src/*`로 매핑됩니다.
- 데이터 패칭은 서버 컴포넌트 또는 Server Actions 방식을 우선 사용합니다.
- `src/app/globals.css` — 전역 스타일 및 Tailwind 디렉티브.
- `next.config.ts` — Next.js 설정 파일 (`output: 'standalone'`, Supabase 이미지 허용).
- `public/` — `/`로 서빙되는 정적 에셋.

## 데이터 접근 추상화 레이어 (Repository 패턴)

**DB 교체 시 `src/lib/db/index.ts`의 import 경로만 변경하면 됩니다.**

```typescript
// 현재: Supabase
import { SupabaseProductRepository } from "./supabase/product.supabase"
export const productRepo: ProductRepository = new SupabaseProductRepository()

// GCP PostgreSQL + Prisma로 교체 시:
// import { PrismaProductRepository } from "./prisma/product.prisma"
// export const productRepo: ProductRepository = new PrismaProductRepository(prisma)
```

actions, pages, API routes는 모두 `@/lib/db`에서 repo를 import하여 사용합니다.
클라이언트 컴포넌트의 Supabase Realtime 구독은 플랫폼 특화 기능이므로 `createClient()`를 직접 사용합니다 (알려진 예외).

## 인증 추상화 레이어

**교체 가능한 인증 설계가 핵심입니다.**

```typescript
// 현재: Supabase Auth
// 교체 시: src/lib/auth/index.ts의 export만 변경
// 나머지 코드(useAuth 훅 등) 무변경

// src/lib/auth/index.ts
export { SupabaseAuthProvider as AuthProviderClass } from './providers/supabase'
// → NextAuth로 교체 시:
// export { NextAuthProvider as AuthProviderClass } from './providers/nextauth'
```

## 알림 시스템

| 채널 | 서비스 | 이벤트 |
|------|--------|--------|
| 카카오 알림톡 | 솔라피(Solapi) | 주문완료/준비중/픽업가능/취소 |
| SMS | 솔라피(Solapi) | 픽업 가능 (ORDER_READY) |
| 앱 푸시 | Firebase FCM | 모든 이벤트, 재고부족 |

**발송 흐름:** 이벤트 발생 → `src/lib/notifications/dispatcher.ts` → 병렬 발송 → `notification_logs` 기록

## 재고 관리

- **자동 차감:** 주문 `status='paid'` → DB 트리거로 `inventory.quantity` 차감 + `stock_histories` 기록
- **자동 환원:** 주문 `status='cancelled'` → 재고 원복
- **임계값 알림:** 재고 ≤ `low_stock_threshold` → 관리자 FCM 푸시
- **재고 이력 타입:** `'in'`(입고) | `'out'`(판매) | `'adjust'`(수동) | `'cancel'`(취소환원)

## 모바일 반응형 전략

- **사용자 페이지:** 웹+모바일 반응형, 모바일 하단 탭바(`MobileBottomNav`)
- **관리자 페이지:** 웹 전용, `lg(1024px)` 미만 접속 시 안내 배너 표시
- **상품 그리드:** `grid-cols-2` → `sm:grid-cols-3` → `lg:grid-cols-4`
- **카테고리:** `overflow-x-auto` 수평 스크롤 pill

## 주요 패키지

```json
{
  "dependencies": {
    "@supabase/ssr": "Supabase SSR 클라이언트",
    "@supabase/supabase-js": "Supabase JS 클라이언트",
    "zustand": "상태 관리 (cartStore, toastStore)",
    "zod": "스키마 유효성 검사",
    "clsx + tailwind-merge": "조건부 클래스 결합 (cn 유틸)",
    "@portone/browser-sdk": "PortOne 결제 SDK",
    "firebase": "FCM 앱 푸시",
    "recharts": "매출 분석 차트"
  }
}
```

## 환경변수

`.env.example` 파일을 복사하여 `.env.local`을 생성하고 값을 입력하세요.

```bash
cp .env.example .env.local
# 이후 .env.local에 실제 값 입력
```

환경변수는 `.gitignore`로 제외되어 있습니다. 실제 키 값은 팀 내부 채널로 공유하세요.

## Git 컨벤션

| 항목 | 규칙 |
|------|------|
| 브랜치 | `feature/{issue-number}-{short-desc}` (예: `feature/42-add-vector-search`) |
| 커밋 | `feat\|fix\|docs\|refactor\|chore\|test: 한글 설명` |
| main 브랜치 | 직접 push 금지, PR 필수 |

**코드 리뷰 체크리스트**
- TypeScript 타입 안전성
- 서버/클라이언트 컴포넌트 경계
- Repository 패턴 준수 (`supabase.from()` 직접 호출 금지, 반드시 repo 경유)
- 에러 처리

## Claude Code 세션 프로토콜

이 프로젝트는 Claude Code와 협업합니다. 새 세션 시작 시:

1. Claude가 `supabase-mgmt` MCP로 자동 컨텍스트 로드
2. 진행 중인 작업·알려진 이슈를 한 줄 요약으로 제공
3. 작업 완료 후 DB(`claude_mgmt` 스키마)에 세션 로그 기록

### 신규 팀원 MCP 설정

```bash
# ~/.claude.json 에 추가 (각자 본인의 Supabase PAT 사용)
{
  "mcpServers": {
    "supabase-mgmt": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref", "rhfpenuhuvvxwlalccym",
        "--access-token", "<본인_SUPABASE_PAT>"
      ]
    }
  }
}
```

Supabase PAT는 [app.supabase.com → Account → Access Tokens](https://app.supabase.com/account/tokens) 에서 발급.

## 요구사항 문서

상세 요구사항은 `docs/requirements.md`를 참조하세요.

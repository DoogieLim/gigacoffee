# REST API 화 구현 문서

**작성일**: 2026-02-26
**프로젝트**: Eatsy (카페 주문 관리 시스템)
**기술 스택**: Next.js 16 + TypeScript + Supabase + Tailwind CSS v4

---

## 📋 목차

1. [개요](#개요)
2. [구현 배경 및 목표](#구현-배경-및-목표)
3. [API 엔드포인트 명세](#api-엔드포인트-명세)
4. [생성된 파일 목록](#생성된-파일-목록)
5. [핵심 구현 사항](#핵심-구현-사항)
6. [문제 해결 과정](#문제-해결-과정)
7. [설정 및 권한](#설정-및-권한)
8. [테스트 방법](#테스트-방법)
9. [주의사항](#주의사항)

---

## 개요

기존에 Server Actions으로만 구현된 기능들을 **REST API**로 전환하여:
- 브라우저 외부 서비스(모바일 앱, 외부 API)에서 접근 가능
- curl/Postman 등으로 직접 테스트 가능
- API 기반 아키텍처로의 전환

---

## 구현 배경 및 목표

### 문제점
- 기존 Server Actions는 서버 전용 함수로, 외부 클라이언트에서 호출 불가
- 메뉴 페이지가 SSR로 변환되어야 하는데 권한 문제로 인한 데이터 로드 실패

### 해결책
- RESTful API 라우트 구현으로 모든 기능을 HTTP 엔드포인트로 노출
- 공통 응답 형식으로 일관성 있는 에러 처리
- JWT 기반 인증 및 역할 기반 접근 제어(RBAC)

---

## API 엔드포인트 명세

### 1. 카테고리 (공개)

#### GET /api/categories
카테고리 목록 조회 (활성화된 항목만)

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "18415a9d-13d5-4fcf-a5bd-6aaf8070a293",
      "name": "커피",
      "slug": "coffee",
      "sort_order": 1,
      "is_active": true
    }
  ]
}
```

---

### 2. 상품 (공개)

#### GET /api/products
상품 목록 조회 (사용 가능한 상품만)

**쿼리 파라미터**:
- `categoryId` (선택): 카테고리 ID로 필터링

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "67b9eef7-52d4-4e9f-bd69-145760e20d5d",
      "category_id": "18415a9d-13d5-4fcf-a5bd-6aaf8070a293",
      "name": "메가리카노 (ICE)",
      "price": 3000,
      "image_url": "https://...",
      "description": "메가커피 시그니처 아이스 아메리카노",
      "is_available": true,
      "options": null,
      "created_at": "2026-02-25T09:44:31.12225+00:00",
      "updated_at": "2026-02-25T09:44:31.12225+00:00"
    }
  ]
}
```

**예시**:
```bash
# 전체 상품
curl http://localhost:3000/api/products

# 특정 카테고리 필터링
curl "http://localhost:3000/api/products?categoryId=c5609273-4440-4178-99df-e7a276c84789"
```

---

#### GET /api/products/[id]
상품 상세 조회

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "67b9eef7-52d4-4e9f-bd69-145760e20d5d",
    "category_id": "18415a9d-13d5-4fcf-a5bd-6aaf8070a293",
    "name": "메가리카노 (ICE)",
    "price": 3000,
    "image_url": "https://...",
    "description": "메가커피 시그니처 아이스 아메리카노",
    "is_available": true,
    "options": null,
    "created_at": "2026-02-25T09:44:31.12225+00:00",
    "updated_at": "2026-02-25T09:44:31.12225+00:00",
    "category": {
      "id": "18415a9d-13d5-4fcf-a5bd-6aaf8070a293",
      "name": "커피",
      "slug": "coffee",
      "sort_order": 1,
      "is_active": true
    }
  }
}
```

**에러 응답**:
```json
{
  "success": false,
  "error": "상품을 찾을 수 없습니다"
}
```

---

### 3. 주문 (인증 필요)

#### GET /api/orders
내 주문 목록 조회

**인증**: JWT (Supabase)
**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "user_id": "user-456",
      "status": "paid",
      "total_amount": 10000,
      "memo": null,
      "created_at": "2026-02-25T10:00:00+00:00",
      "updated_at": "2026-02-25T10:00:00+00:00",
      "order_items": [
        {
          "product_name": "메가리카노 (ICE)",
          "quantity": 2
        }
      ]
    }
  ]
}
```

**미인증 응답 (401)**:
```json
{
  "success": false,
  "error": "인증이 필요합니다"
}
```

---

#### POST /api/orders
주문 생성

**인증**: JWT (필수)
**요청 본문**:
```json
{
  "items": [
    {
      "product_id": "67b9eef7-52d4-4e9f-bd69-145760e20d5d",
      "product_name": "메가리카노 (ICE)",
      "price": 3000,
      "quantity": 2,
      "options": [],
      "image_url": "https://..."
    }
  ],
  "memo": "덜 달게 해주세요"
}
```

**응답 (201)**:
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "user_id": "user-456",
    "status": "pending",
    "total_amount": 6000,
    "memo": "덜 달게 해주세요",
    "created_at": "2026-02-25T10:00:00+00:00",
    "updated_at": "2026-02-25T10:00:00+00:00"
  }
}
```

---

#### PATCH /api/orders/[id]
주문 상태 변경 (관리자/스태프)

**인증**: JWT + 권한 (admin, staff)
**요청 본문**:
```json
{
  "status": "preparing"
}
```

**상태 값**: `pending`, `paid`, `preparing`, `ready`, `completed`, `cancelled`

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "status": "preparing",
    "updated_at": "2026-02-25T10:05:00+00:00"
  }
}
```

**권한 부족 응답 (403)**:
```json
{
  "success": false,
  "error": "권한이 없습니다"
}
```

---

### 4. 회원 정보 (인증 필요)

#### GET /api/members/me
내 프로필 조회

**인증**: JWT
**응답**:
```json
{
  "success": true,
  "data": {
    "id": "user-456",
    "name": "김철수",
    "email": "kim@example.com",
    "phone": "010-1234-5678",
    "avatar_url": "https://...",
    "fcm_token": null,
    "is_active": true,
    "created_at": "2026-01-15T00:00:00+00:00",
    "updated_at": "2026-02-25T10:00:00+00:00"
  }
}
```

---

#### PATCH /api/members/me
내 프로필 수정

**인증**: JWT
**요청 본문** (선택사항):
```json
{
  "name": "김철수",
  "phone": "010-1234-5678",
  "avatar_url": "https://...",
  "fcm_token": "firebase-token-xxx"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "user-456",
    "name": "김철수",
    "email": "kim@example.com",
    "phone": "010-1234-5678",
    "avatar_url": "https://...",
    "fcm_token": "firebase-token-xxx",
    "is_active": true,
    "updated_at": "2026-02-25T10:05:00+00:00"
  }
}
```

---

#### GET /api/members
전체 회원 목록 (관리자)

**인증**: JWT + 권한 (admin)
**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user-456",
      "name": "김철수",
      "email": "kim@example.com",
      "phone": "010-1234-5678",
      "avatar_url": null,
      "is_active": true,
      "created_at": "2026-01-15T00:00:00+00:00",
      "updated_at": "2026-02-25T10:00:00+00:00"
    }
  ]
}
```

---

### 5. 재고 관리 (관리자/스태프)

#### PATCH /api/inventory/[productId]
재고 조정

**인증**: JWT + 권한 (admin, staff)
**요청 본문**:
```json
{
  "quantity": 50,
  "reason": "신상품 입고"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "productId": "67b9eef7-52d4-4e9f-bd69-145760e20d5d",
    "quantity": 50,
    "changeQty": 10
  }
}
```

---

### 6. 판매 분석 (관리자)

#### GET /api/sales
매출 데이터 조회

**인증**: JWT + 권한 (admin)
**쿼리 파라미터**:
- `period` (선택, 기본값: "today"): `today`, `week`, `month`

**응답**:
```json
{
  "success": true,
  "data": {
    "period": "today",
    "fromDate": "2026-02-26T00:00:00.000Z",
    "toDate": "2026-02-26T15:30:45.123Z",
    "totalSales": 125000,
    "totalOrders": 8,
    "paidOrders": 6,
    "completedOrders": 5,
    "salesByDate": {
      "2026-02-26": {
        "total": 125000,
        "count": 8
      }
    }
  }
}
```

---

### 7. 알림 로그 (관리자)

#### GET /api/notifications/logs
알림 발송 로그 조회 (페이징)

**인증**: JWT + 권한 (admin)
**쿼리 파라미터**:
- `page` (선택, 기본값: 1): 페이지 번호
- `limit` (선택, 기본값: 20): 페이지당 항목 수

**응답**:
```json
{
  "success": true,
  "data": [
    {
      "id": "log-123",
      "type": "push",
      "recipientId": "user-456",
      "eventType": "ORDER_READY",
      "payload": { "orderId": "order-123" },
      "status": "success",
      "sentAt": "2026-02-25T10:00:00+00:00"
    }
  ],
  "pagination": {
    "total": 245,
    "page": 1,
    "limit": 20,
    "pages": 13
  }
}
```

---

## 생성된 파일 목록

### 새로 생성된 파일

#### 라이브러리
- `src/lib/api/response.ts` - 공통 응답 형식 유틸
- `src/lib/api/auth.ts` - 인증 및 권한 검증 유틸
- `src/lib/utils/image.ts` - 이미지 URL 정규화 유틸

#### API 라우트
- `src/app/api/categories/route.ts` - 카테고리 목록
- `src/app/api/products/route.ts` - 상품 목록
- `src/app/api/products/[id]/route.ts` - 상품 상세
- `src/app/api/orders/route.ts` - 주문 목록/생성
- `src/app/api/orders/[id]/route.ts` - 주문 상태 변경
- `src/app/api/members/me/route.ts` - 내 프로필
- `src/app/api/members/route.ts` - 회원 목록
- `src/app/api/inventory/[productId]/route.ts` - 재고 조정
- `src/app/api/sales/route.ts` - 매출 분석
- `src/app/api/notifications/logs/route.ts` - 알림 로그

#### UI 컴포넌트
- `src/app/(main)/menu/[id]/page.tsx` - 상품 상세 페이지
- `src/components/menu/CategoryFilterClient.tsx` - 클라이언트 카테고리 필터

### 수정된 파일

#### 라이브러리
- `src/lib/db/supabase/product.supabase.ts` - createServiceClient → createClient로 변경

#### API 라우트
- `src/app/api/orders/route.ts` - GET에 POST 추가

#### UI 페이지
- `src/app/(main)/menu/page.tsx` - SSR → 클라이언트 컴포넌트로 전환 (REST API 연동)

#### UI 컴포넌트
- `src/components/menu/ProductCard.tsx` - Image → img 태그로 변경, 이미지 URL 정규화 적용

---

## 핵심 구현 사항

### 1. 공통 응답 형식 (`src/lib/api/response.ts`)

```typescript
export function apiSuccess(data: unknown, status = 200): Response
export function apiError(message: string, status = 400): Response
export function apiPaginated(
  data: unknown[],
  total: number,
  page: number,
  limit: number
): Response
```

**특징**:
- 모든 성공 응답: `{ success: true, data: ... }`
- 모든 에러 응답: `{ success: false, error: "..." }`
- 페이징: `{ success: true, data: [...], pagination: { total, page, limit, pages } }`

---

### 2. 인증 및 권한 검증 (`src/lib/api/auth.ts`)

```typescript
async function getAuthUser(request: NextRequest): Promise<AuthUser | null>
async function requireAuth(request: NextRequest): Promise<AuthUser>
async function requireRole(request: NextRequest, roles: string[]): Promise<AuthUser>
```

**특징**:
- JWT 기반 인증 (Supabase)
- 역할 기반 접근 제어 (admin, staff, user)
- 미인증/미권한 시 즉시 Response throw

**사용 예**:
```typescript
// 인증 필요한 엔드포인트
const user = await requireAuth(request)

// 특정 권한 필요한 엔드포인트
const adminUser = await requireRole(request, ["admin", "staff"])
```

---

### 3. 메뉴 페이지 REST API 연동 (`src/app/(main)/menu/page.tsx`)

**기존**: Server Actions + SSR
**변경**: 클라이언트 컴포넌트 + REST API

```typescript
"use client"

useEffect(() => {
  const fetchData = async () => {
    const [catsRes, prodsRes] = await Promise.all([
      fetch("/api/categories"),
      fetch(`/api/products${categoryId ? `?categoryId=${categoryId}` : ""}`),
    ])

    const catsData = await catsRes.json()
    const prodsData = await prodsRes.json()

    setCategories(catsData.data || [])
    setProducts(prodsData.data || [])
  }

  fetchData()
}, [categoryId])
```

**장점**:
- 클라이언트에서 직접 API 호출 가능
- 카테고리 선택 시 실시간 업데이트
- URL 파라미터 기반 필터링

---

### 4. 상품 상세 페이지 (`src/app/(main)/menu/[id]/page.tsx`)

**기능**:
- REST API로부터 상품 데이터 조회
- 이미지 표시
- 수량 선택
- 장바구니에 담기

```typescript
const handleAddToCart = () => {
  addItem({
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    quantity,
    options: [],
    image_url: product.image_url,
  })
  router.push("/order")
}
```

---

### 5. 이미지 URL 정규화 (`src/lib/utils/image.ts`)

**배경**:
- 데이터베이스에 저장된 이미지 URL이 다른 Supabase 프로젝트의 도메인 사용
- 현재 프로젝트에서 접근 불가

**해결책**:
```typescript
export function normalizeImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null

  const currentDomain = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (imageUrl.includes(currentDomain)) {
    return imageUrl
  }

  // 다른 Supabase 프로젝트의 이미지라면, 경로만 추출
  const pathMatch = imageUrl.match(/\/storage\/v1\/object\/.*/)
  if (pathMatch) {
    return `${currentDomain}${pathMatch[0]}`
  }

  return imageUrl
}
```

**사용**:
```typescript
<img
  src={normalizeImageUrl(product.image_url) || product.image_url}
  alt={product.name}
/>
```

---

## 문제 해결 과정

### 문제 1: API에서 데이터를 조회하지 못함

**증상**: GET /api/products, GET /api/categories 모두 빈 배열 반환

**원인 분석**:
1. 처음에는 `createServiceClient()` 사용 → `SUPABASE_SERVICE_ROLE_KEY` 권한 부족
2. `createClient()`로 변경했지만 여전히 실패
3. 디버그 엔드포인트로 테스트 후 발견: Supabase RLS 권한 설정 미흡

**해결책**:
```sql
-- Supabase SQL Editor에서 실행
GRANT USAGE ON SCHEMA eatsy TO anon, authenticated;
GRANT SELECT ON eatsy.products TO anon, authenticated;
GRANT SELECT ON eatsy.categories TO anon, authenticated;

CREATE POLICY "Allow public read on products"
ON eatsy.products FOR SELECT USING (true);
CREATE POLICY "Allow public read on categories"
ON eatsy.categories FOR SELECT USING (true);
```

---

### 문제 2: 이미지가 로드되지 않음

**증상**: 메뉴 페이지에서 상품 카드의 이미지가 모두 깨짐

**원인 분석**:
1. 초기 가정: Next.js Image 컴포넌트 설정 문제
2. next.config.ts의 remotePatterns 확인 → 올바르게 설정됨
3. 브라우저 개발자 도구 Network 탭 확인 → DNS 조회 실패

**원인 발견**:
```
이미지 URL: https://rnzfohzrkxqbnqukdhgk.supabase.co/storage/...
실제 도메인: https://rhfpenuhuvvxwlalccym.supabase.co

→ 다른 Supabase 프로젝트에 저장된 이미지!
```

**해결책**: `normalizeImageUrl()` 함수로 URL 도메인 변환

---

### 문제 3: 상품 상세 페이지 404 에러

**증상**: 상품 카드 클릭 시 404 페이지 표시

**원인**: `/menu/[id]` 라우트 페이지가 없음

**해결책**: `src/app/(main)/menu/[id]/page.tsx` 생성

---

## 설정 및 권한

### Supabase 권한 설정

#### 필수 SQL (Supabase SQL Editor에서 실행)

```sql
-- 스키마 접근 권한
GRANT USAGE ON SCHEMA eatsy TO anon, authenticated;

-- 테이블 SELECT 권한
GRANT SELECT ON eatsy.categories TO anon, authenticated;
GRANT SELECT ON eatsy.products TO anon, authenticated;
GRANT SELECT ON eatsy.inventory TO anon, authenticated;
GRANT SELECT ON eatsy.orders TO anon, authenticated;
GRANT SELECT ON eatsy.profiles TO anon, authenticated;
GRANT SELECT ON eatsy.notification_logs TO anon, authenticated;

-- RLS 정책 (공개 읽기)
CREATE POLICY "Allow public read on categories"
ON eatsy.categories FOR SELECT USING (true);

CREATE POLICY "Allow public read on products"
ON eatsy.products FOR SELECT USING (true);

-- 사용자가 자신의 주문만 볼 수 있도록
CREATE POLICY "Users can read own orders"
ON eatsy.orders FOR SELECT
USING (auth.uid() = user_id);

-- 사용자가 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
ON eatsy.profiles FOR UPDATE
USING (auth.uid() = id);
```

### 환경변수 (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://rhfpenuhuvvxwlalccym.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."

# 기타 환경변수들...
```

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { hostname: "*.supabase.co" },
    ],
  },
};
```

---

## 테스트 방법

### 1. 명령줄 테스트 (curl)

```bash
# 카테고리 조회
curl http://localhost:3000/api/categories

# 상품 목록 (전체)
curl http://localhost:3000/api/products

# 상품 목록 (카테고리 필터링)
curl "http://localhost:3000/api/products?categoryId=c5609273-4440-4178-99df-e7a276c84789"

# 상품 상세 (ID: 67b9eef7-52d4-4e9f-bd69-145760e20d5d)
curl http://localhost:3000/api/products/67b9eef7-52d4-4e9f-bd69-145760e20d5d

# 인증 필요한 엔드포인트 (미인증)
curl http://localhost:3000/api/members/me
# 응답: { "success": false, "error": "인증이 필요합니다" }
```

### 2. 브라우저 테스트

```
메뉴 페이지
- URL: http://localhost:3000/menu
- 동작: 카테고리 필터링, 상품 조회, 이미지 로드 확인

상품 상세 페이지
- URL: http://localhost:3000/menu/[상품ID]
- 동작: 상품 정보 표시, 수량 선택, 장바구니 담기 동작 확인

브라우저 개발자 도구
- Network 탭: API 요청/응답 확인
- Console 탭: 에러 메시지 확인
```

### 3. Postman/Thunder Client 테스트

```
GET http://localhost:3000/api/categories
Authorization: 불필요

GET http://localhost:3000/api/products?categoryId=...
Authorization: 불필요

GET http://localhost:3000/api/members/me
Authorization: Bearer <JWT_TOKEN> (필수)
```

---

## 주의사항

### 1. Supabase 스키마 설정

- 모든 테이블이 `public` 스키마가 아니라 **`eatsy` 스키마**에 위치
- createClient 초기화 시 반드시 `db: { schema: "eatsy" }` 지정

### 2. 이미지 URL 변환

- 데이터베이스의 이미지 URL이 다른 Supabase 프로젝트를 가리킬 수 있음
- 반드시 `normalizeImageUrl()` 함수로 변환 후 사용

### 3. 인증 흐름

- 모든 인증은 Supabase JWT 기반
- `requireAuth()`, `requireRole()` 함수는 미인증 시 즉시 Response throw
- API 라우트 핸들러에서 try-catch로 감싸야 함

```typescript
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(request, ["admin"])
    // ... 로직
  } catch (error) {
    if (error instanceof Response) {
      return error // 인증/권한 에러 Response
    }
    return apiError("...", 500)
  }
}
```

### 4. CORS 및 클라이언트 호출

- 클라이언트에서 fetch로 API 호출 가능 (같은 도메인이므로 CORS 문제 없음)
- 외부 도메인에서 호출 시 CORS 설정 필요 (현재 구현되지 않음)

### 5. 페이징

- `GET /api/notifications/logs`는 페이징 지원
- 기본값: page=1, limit=20
- 최대 limit=100

---

## 추가 구현 가능한 기능

### 현재 미구현 사항
1. CORS 설정 (외부 클라이언트 지원)
2. API 문서 자동 생성 (Swagger/OpenAPI)
3. 요청 로깅/모니터링
4. Rate Limiting
5. API 버전 관리

### 개선 사항
1. 상품 옵션 API 추가
2. 주문 취소 API 추가
3. 배송 조회 API 추가
4. 결제 내역 API 추가
5. 리뷰 API 추가

---

## 요약

| 항목 | 내용 |
|------|------|
| **생성된 파일** | 13개 (API 10개, 컴포넌트 2개, 유틸 1개) |
| **수정된 파일** | 5개 |
| **API 엔드포인트** | 12개 |
| **인증 방식** | Supabase JWT |
| **권한 제어** | 역할 기반 (admin, staff, user) |
| **페이징** | 지원 (notifications/logs) |
| **에러 처리** | 공통 형식 (success, error) |
| **주요 해결 문제** | RLS 권한, 이미지 도메인 |

---

**마지막 수정**: 2026-02-26
**작업 완료 상태**: ✅ 완료 및 테스트 완료

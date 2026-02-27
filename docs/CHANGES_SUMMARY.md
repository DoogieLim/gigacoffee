# 변경 사항 요약 (Changes Summary)

**작성일**: 2026-02-26
**작업**: REST API 화 구현

---

## 📊 변경 통계

| 카테고리 | 개수 |
|---------|------|
| 새로 생성된 파일 | 13개 |
| 수정된 파일 | 5개 |
| 삭제된 파일 | 0개 |
| **총 변경 파일** | **18개** |

---

## 🆕 새로 생성된 파일 (13개)

### 라이브러리 (3개)
1. **`src/lib/api/response.ts`**
   - 목적: 공통 API 응답 형식
   - 함수: `apiSuccess()`, `apiError()`, `apiPaginated()`
   - 영향: 모든 API 라우트에서 사용

2. **`src/lib/api/auth.ts`**
   - 목적: 인증 및 권한 검증
   - 함수: `getAuthUser()`, `requireAuth()`, `requireRole()`
   - 영향: 인증이 필요한 모든 API에서 사용

3. **`src/lib/utils/image.ts`**
   - 목적: 이미지 URL 정규화
   - 함수: `normalizeImageUrl()`
   - 영향: ProductCard, 상품 상세 페이지에서 사용

### API 라우트 (10개)

#### 공개 API
4. **`src/app/api/categories/route.ts`**
   - 메서드: GET
   - 인증: 불필요
   - 기능: 카테고리 목록 조회

5. **`src/app/api/products/route.ts`**
   - 메서드: GET
   - 인증: 불필요
   - 기능: 상품 목록 조회 (categoryId 필터링 가능)

6. **`src/app/api/products/[id]/route.ts`**
   - 메서드: GET
   - 인증: 불필요
   - 기능: 상품 상세 조회

#### 사용자 API
7. **`src/app/api/orders/[id]/route.ts`** (새 파일)
   - 메서드: PATCH
   - 인증: 필수 (admin, staff)
   - 기능: 주문 상태 변경

8. **`src/app/api/members/me/route.ts`**
   - 메서드: GET, PATCH
   - 인증: 필수
   - 기능: 내 프로필 조회/수정

9. **`src/app/api/members/route.ts`**
   - 메서드: GET
   - 인증: 필수 (admin)
   - 기능: 전체 회원 목록 조회

#### 관리자 API
10. **`src/app/api/inventory/[productId]/route.ts`**
    - 메서드: PATCH
    - 인증: 필수 (admin, staff)
    - 기능: 재고 조정

11. **`src/app/api/sales/route.ts`**
    - 메서드: GET
    - 인증: 필수 (admin)
    - 기능: 매출 데이터 조회 (period 필터링)

12. **`src/app/api/notifications/logs/route.ts`**
    - 메서드: GET
    - 인증: 필수 (admin)
    - 기능: 알림 로그 조회 (페이징)

### UI 컴포넌트 (2개)

13. **`src/app/(main)/menu/[id]/page.tsx`** (새 페이지)
    - 목적: 상품 상세 페이지
    - 타입: 클라이언트 컴포넌트
    - 기능: 상품 정보 표시, 수량 선택, 장바구니 담기

14. **`src/components/menu/CategoryFilterClient.tsx`** (새 컴포넌트)
    - 목적: 클라이언트 기반 카테고리 필터
    - 타입: 클라이언트 컴포넌트
    - 기능: URL 파라미터로 카테고리 필터링

---

## ✏️ 수정된 파일 (5개)

### 1. `src/lib/db/supabase/product.supabase.ts`
**변경 사항**:
```typescript
// Before
import { createServiceClient } from "@/lib/supabase/server"
private async db() {
  return createServiceClient()
}

// After
import { createClient } from "@/lib/supabase/server"
private async db() {
  return createClient()
}
```
**이유**: SERVICE_ROLE_KEY의 권한 부족으로 스키마 접근 불가 → anon key 사용으로 변경

---

### 2. `src/app/api/orders/route.ts`
**변경 사항**:
- GET 메서드 기존 유지
- POST 메서드 추가 (주문 생성)
- 응답 형식 통일 (`apiSuccess()` 함수 사용)

**Before**:
```typescript
export async function GET() {
  // ... 기존 코드
  return NextResponse.json(orders)
}
```

**After**:
```typescript
export async function GET(request: NextRequest) {
  // ... 수정된 코드
  return apiSuccess(orders)
}

export async function POST(request: NextRequest) {
  // ... 새로운 코드
  return apiSuccess(order, 201)
}
```

---

### 3. `src/app/(main)/menu/page.tsx`
**변경 사항**:
- SSR (Server Component) → 클라이언트 컴포넌트로 전환
- Server Actions 사용 → REST API fetch로 변경

**Before**:
```typescript
export default async function MenuPage() {
  const [products, categories] = await Promise.all([
    productRepo.findAll({ categoryId, availableOnly: true }),
    productRepo.findCategories(true),
  ])
  return <div>...</div>
}
```

**After**:
```typescript
"use client"

export default function MenuPage() {
  useEffect(() => {
    fetch("/api/categories")
    fetch("/api/products?categoryId=...")
  }, [categoryId])
  return <div>...</div>
}
```

**이유**:
- Server Component에서 권한 문제로 데이터 조회 실패
- 클라이언트에서 REST API 호출로 해결

---

### 4. `src/components/menu/ProductCard.tsx`
**변경 사항**:
- `Image` 컴포넌트 → `<img>` 태그로 변경
- 이미지 URL 정규화 함수 적용

**Before**:
```typescript
import Image from "next/image"

<Image
  src={product.image_url}
  alt={product.name}
  fill
  className="object-cover transition-transform group-hover:scale-105"
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  unoptimized
/>
```

**After**:
```typescript
import { normalizeImageUrl } from "@/lib/utils/image"

<img
  src={normalizeImageUrl(product.image_url) || product.image_url}
  alt={product.name}
  className="h-full w-full object-cover transition-transform group-hover:scale-105"
/>
```

**이유**:
- Next.js Image 컴포넌트 제한으로 인한 로드 실패
- 이미지 URL 도메인이 다른 Supabase 프로젝트 → 정규화 필요

---

### 5. `src/components/menu/CategoryFilterClient.tsx` (기존 파일 이름 변경)
**변경 사항**:
- `CategoryFilter.tsx` → `CategoryFilterClient.tsx`로 이름 변경
- URL 파라미터 기반 필터링으로 변경
- 원본 파일은 유지 (하위호환성)

**Before** (상태 기반):
```typescript
const [selectedCategory, setSelectedCategory] = useState(null)
const handleSelect = (id) => setSelectedCategory(id)
```

**After** (URL 파라미터 기반):
```typescript
const router = useRouter()
const handleSelect = (id) => {
  const params = new URLSearchParams(searchParams)
  if (id) params.set("categoryId", id)
  else params.delete("categoryId")
  router.push(`/menu?${params.toString()}`)
}
```

---

## 🔄 마이그레이션 경로

### Server Actions → REST API

**기존 방식**:
```typescript
// Server Action
"use server"
export async function getProducts(categoryId?: string) {
  return productRepo.findAll({ categoryId })
}

// 사용
const products = await getProducts(categoryId)
```

**새로운 방식**:
```typescript
// REST API
// GET /api/products?categoryId=...
const res = await fetch("/api/products?categoryId=...")
const { data: products } = await res.json()
```

---

## 📈 API 엔드포인트 추가

| 경로 | 메서드 | 인증 | 상태 |
|------|--------|------|------|
| `/api/categories` | GET | ❌ | ✅ 신규 |
| `/api/products` | GET | ❌ | ✅ 신규 |
| `/api/products/[id]` | GET | ❌ | ✅ 신규 |
| `/api/orders` | GET | ✅ | 기존 (수정) |
| `/api/orders` | POST | ✅ | ✅ 신규 |
| `/api/orders/[id]` | PATCH | ✅ | ✅ 신규 |
| `/api/members/me` | GET | ✅ | ✅ 신규 |
| `/api/members/me` | PATCH | ✅ | ✅ 신규 |
| `/api/members` | GET | ✅ | ✅ 신규 |
| `/api/inventory/[productId]` | PATCH | ✅ | ✅ 신규 |
| `/api/sales` | GET | ✅ | ✅ 신규 |
| `/api/notifications/logs` | GET | ✅ | ✅ 신규 |

---

## 🐛 버그 수정

### 1. Supabase RLS 권한 문제
**증상**: `permission denied for schema gigacoffee`
**원인**: anon, authenticated role에 스키마/테이블 접근 권한 없음
**해결**: SQL로 권한 설정

```sql
GRANT USAGE ON SCHEMA gigacoffee TO anon, authenticated;
GRANT SELECT ON gigacoffee.products TO anon, authenticated;
GRANT SELECT ON gigacoffee.categories TO anon, authenticated;
```

---

### 2. 이미지 로드 실패
**증상**: 상품 카드의 이미지가 모두 깨짐
**원인**: 이미지 URL의 도메인이 다른 Supabase 프로젝트 가리킴
**해결**: `normalizeImageUrl()` 함수로 도메인 변환

```typescript
// https://rnzfohzrkxqbnqukdhgk.supabase.co/storage/...
// → https://rhfpenuhuvvxwlalccym.supabase.co/storage/...
```

---

### 3. 상품 상세 페이지 404
**증상**: 상품 카드 클릭 시 404 에러
**원인**: `/menu/[id]` 라우트 페이지 없음
**해결**: `src/app/(main)/menu/[id]/page.tsx` 생성

---

## 📋 체크리스트 (다른 개발자용)

이 문서를 통해 동일한 개발을 진행할 때 확인해야 할 사항:

- [ ] 새로 생성된 13개 파일이 모두 생성되었는가?
- [ ] 기존 5개 파일이 정확히 수정되었는가?
- [ ] Supabase RLS 권한 설정 SQL을 실행했는가?
- [ ] 환경변수 (.env.local)가 올바르게 설정되었는가?
- [ ] `npm run dev`로 개발 서버가 정상 실행되는가?
- [ ] `curl http://localhost:3000/api/categories` 응답이 `{ "success": true, "data": [...] }` 형식인가?
- [ ] http://localhost:3000/menu에서 이미지가 로드되는가?
- [ ] 상품 카드를 클릭해서 상세 페이지가 로드되는가?

---

## 🚀 배포 전 확인사항

1. **Supabase 권한 설정**: 프로덕션 데이터베이스에서도 RLS 권한 설정
2. **환경변수**: 프로덕션 Supabase 프로젝트의 키로 변경
3. **이미지 도메인**: 프로덕션 Supabase 도메인으로 `normalizeImageUrl()` 동작 확인
4. **API 문서**: 팀원들을 위한 API 문서 공유
5. **CORS 설정**: 외부 클라이언트 필요 시 CORS 설정 추가

---

**다음 작업 제안**:
1. API 문서 자동 생성 (Swagger/OpenAPI)
2. API 테스트 자동화 (Jest + Supertest)
3. CORS 설정 및 외부 클라이언트 지원
4. 추가 API 엔드포인트 구현 (상품 옵션, 주문 취소 등)

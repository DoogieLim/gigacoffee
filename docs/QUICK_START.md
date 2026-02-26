# 빠른 시작 가이드 (Quick Start Guide)

**대상**: 이 프로젝트를 처음 받아서 개발을 시작하는 개발자

---

## 📦 프로젝트 설정 (5분)

### 1단계: 저장소 클론
```bash
git clone <repository-url>
cd study
```

### 2단계: 패키지 설치
```bash
npm install
```

### 3단계: 환경변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local

# 또는 직접 생성 후 다음 값들 입력:
NEXT_PUBLIC_SUPABASE_URL="https://rhfpenuhuvvxwlalccym.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
```

### 4단계: Supabase 권한 설정
Supabase 대시보드 → SQL Editor에서 다음 코드 실행:

```sql
-- 스키마 접근 권한
GRANT USAGE ON SCHEMA eatsy TO anon, authenticated;

-- 테이블 SELECT 권한
GRANT SELECT ON eatsy.categories TO anon, authenticated;
GRANT SELECT ON eatsy.products TO anon, authenticated;
GRANT SELECT ON eatsy.orders TO anon, authenticated;
GRANT SELECT ON eatsy.profiles TO anon, authenticated;
GRANT SELECT ON eatsy.inventory TO anon, authenticated;

-- RLS 정책
CREATE POLICY "Allow public read on categories"
ON eatsy.categories FOR SELECT USING (true);

CREATE POLICY "Allow public read on products"
ON eatsy.products FOR SELECT USING (true);
```

### 5단계: 개발 서버 시작
```bash
npm run dev
```

브라우저에서 http://localhost:3000 방문

---

## ✅ 설정 확인 (2분)

설정이 올바른지 확인하려면:

### 터미널에서 확인
```bash
# 카테고리 API 테스트
curl http://localhost:3000/api/categories

# 응답이 다음과 같으면 성공:
# { "success": true, "data": [...] }
```

### 브라우저에서 확인
```
1. http://localhost:3000/menu 방문
2. 상품이 표시되고 이미지가 로드되는지 확인
3. 상품 카드 클릭해서 상세 페이지 로드 확인
```

---

## 🗂️ 프로젝트 구조 개요

```
src/
├── app/
│   ├── (main)/
│   │   ├── menu/
│   │   │   ├── page.tsx          ← 메뉴 페이지 (REST API 사용)
│   │   │   └── [id]/page.tsx     ← 상품 상세 페이지 (신규)
│   │   └── ...
│   └── api/
│       ├── categories/route.ts    ← 카테고리 API (신규)
│       ├── products/
│       │   ├── route.ts           ← 상품 API (신규)
│       │   └── [id]/route.ts      ← 상품 상세 API (신규)
│       ├── orders/
│       │   ├── route.ts           ← 주문 API (수정)
│       │   └── [id]/route.ts      ← 주문 상태 변경 API (신규)
│       ├── members/
│       │   ├── me/route.ts        ← 내 프로필 API (신규)
│       │   └── route.ts           ← 회원 목록 API (신규)
│       ├── inventory/
│       │   └── [productId]/route.ts ← 재고 API (신규)
│       ├── sales/route.ts         ← 매출 API (신규)
│       └── notifications/
│           └── logs/route.ts      ← 알림 로그 API (신규)
│
├── lib/
│   ├── api/
│   │   ├── response.ts            ← 공통 응답 형식 (신규)
│   │   └── auth.ts                ← 인증/권한 검증 (신규)
│   ├── utils/
│   │   └── image.ts               ← 이미지 URL 정규화 (신규)
│   ├── db/
│   │   └── supabase/product.supabase.ts ← 수정됨
│   └── ...
│
└── components/
    └── menu/
        ├── ProductCard.tsx        ← 수정됨
        └── CategoryFilterClient.tsx ← 신규
```

---

## 🔑 핵심 개념

### 1. REST API 응답 형식
모든 API 응답은 동일한 형식:

```json
// 성공
{ "success": true, "data": [...] }

// 에러
{ "success": false, "error": "에러 메시지" }

// 페이징
{ "success": true, "data": [...], "pagination": { "total": 100, "page": 1, "limit": 20 } }
```

### 2. 인증 (JWT)
인증이 필요한 API:
- 요청 헤더: `Authorization: Bearer <JWT_TOKEN>`
- Supabase에서 로그인 시 자동으로 토큰 발급

### 3. 권한 제어 (RBAC)
```typescript
// admin 또는 staff 권한만
await requireRole(request, ["admin", "staff"])

// 또는 로그인만 필요
const user = await requireAuth(request)
```

### 4. 이미지 URL 변환
```typescript
// 다른 Supabase 프로젝트의 이미지도 접근 가능
normalizeImageUrl(imageUrl)
// https://old-domain/storage/... → https://current-domain/storage/...
```

---

## 🧪 API 테스트

### 명령줄 (curl)
```bash
# 카테고리 조회 (인증 불필요)
curl http://localhost:3000/api/categories

# 상품 조회 (필터링 가능)
curl "http://localhost:3000/api/products?categoryId=c5609273-4440-4178-99df-e7a276c84789"

# 상품 상세 조회
curl http://localhost:3000/api/products/67b9eef7-52d4-4e9f-bd69-145760e20d5d

# 내 프로필 조회 (인증 필요 - 미인증 시 401)
curl http://localhost:3000/api/members/me
# 응답: { "success": false, "error": "인증이 필요합니다" }
```

### Postman/Thunder Client
1. 새 Request 생성
2. Method: GET
3. URL: `http://localhost:3000/api/categories`
4. **Send** 클릭

---

## 📝 자주 묻는 질문

### Q1: "permission denied for schema eatsy" 에러가 나요
**A**: Supabase RLS 권한 설정이 필요합니다.
```sql
GRANT USAGE ON SCHEMA eatsy TO anon, authenticated;
```

### Q2: 이미지가 안 보여요
**A**: 확인할 사항:
1. 브라우저 개발자 도구 → Network 탭에서 이미지 요청 확인
2. 상태 코드가 200인지 확인 (404면 권한 문제)
3. `normalizeImageUrl()` 함수가 올바르게 적용되었는지 확인

### Q3: 상품을 클릭해도 404가 나요
**A**: `/menu/[id]/page.tsx` 파일이 생성되었는지 확인하세요.

### Q4: 상품이 나오지 않아요
**A**: 확인할 사항:
1. Supabase 데이터베이스에 `products` 테이블에 데이터 있는지 확인
2. `is_available = true`인 상품이 있는지 확인
3. RLS 정책이 올바르게 설정되었는지 확인
4. 터미널에서 `curl http://localhost:3000/api/products` 테스트

---

## 🚀 다음 단계

### 개발 시작
1. 문서 읽기:
   - `REST_API_IMPLEMENTATION.md` - 상세 명세
   - `CHANGES_SUMMARY.md` - 변경 사항 요약

2. 코드 탐색:
   - `src/lib/api/response.ts` - 응답 형식 이해
   - `src/lib/api/auth.ts` - 인증 방식 이해
   - `src/app/api/products/route.ts` - API 구현 방식 학습

3. 기능 확장:
   - 새로운 API 엔드포인트 추가
   - 클라이언트 페이지 추가
   - 데이터베이스 스키마 확장

### 배포 준비
1. 환경변수를 프로덕션 Supabase 값으로 변경
2. Supabase RLS 정책을 프로덕션 데이터베이스에 적용
3. `npm run build` 로 빌드 테스트
4. 호스팅 플랫폼에 배포

---

## 📚 추가 자료

| 문서 | 용도 |
|------|------|
| `REST_API_IMPLEMENTATION.md` | 전체 API 명세 및 구현 상세 |
| `CHANGES_SUMMARY.md` | 파일별 변경 사항 |
| `CLAUDE.md` | 프로젝트 아키텍처 및 컨벤션 |

---

## 💬 도움이 필요하면

### 에러 메시지로 검색
1. 에러 메시지 전체 복사
2. `CHANGES_SUMMARY.md`의 "버그 수정" 섹션 확인
3. `REST_API_IMPLEMENTATION.md`의 "문제 해결 과정" 섹션 확인

### 상세 정보 확인
- API 명세: `REST_API_IMPLEMENTATION.md` → "API 엔드포인트 명세"
- 파일 위치: `CHANGES_SUMMARY.md` → "새로 생성된 파일"
- 구현 방식: 각 파일의 주석 및 코드 참고

---

## ✨ 완료!

축하합니다! 이제 프로젝트 설정이 완료되었습니다.

다음 명령어로 개발을 시작하세요:
```bash
npm run dev
```

그 다음:
1. http://localhost:3000/menu 방문
2. 상품 둘러보기
3. 상품 클릭해서 상세 페이지 확인

**Happy coding! 🎉**

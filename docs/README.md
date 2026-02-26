# 📚 Eatsy 프로젝트 문서

REST API 화 구현 관련 모든 문서를 한 곳에서 관리합니다.

---

## 📖 문서 목록

### 1. 🚀 [빠른 시작 가이드](./QUICK_START.md)
**누가 읽어야 하나**: 처음 이 프로젝트를 받는 개발자
**소요 시간**: 10분

**포함 내용**:
- 프로젝트 설정 단계별 가이드
- 환경변수 설정
- Supabase 권한 설정
- 설정 확인 방법
- 자주 묻는 질문 (FAQ)

**읽기**: [QUICK_START.md](./QUICK_START.md)

---

### 2. 📋 [REST API 상세 구현 문서](./REST_API_IMPLEMENTATION.md)
**누가 읽어야 하나**: API를 이해하고 사용하려는 개발자
**소요 시간**: 30분

**포함 내용**:
- API 엔드포인트 전체 명세 (12개)
- 요청/응답 예시
- 생성된 파일 목록 (13개)
- 수정된 파일 목록 (5개)
- 핵심 구현 사항
- 문제 해결 과정
- Supabase 설정 방법
- 테스트 방법

**읽기**: [REST_API_IMPLEMENTATION.md](./REST_API_IMPLEMENTATION.md)

---

### 3. 📝 [변경 사항 요약](./CHANGES_SUMMARY.md)
**누가 읽어야 하나**: 코드 검토자 또는 통합 담당자
**소요 시간**: 15분

**포함 내용**:
- 변경 통계 (파일 13개 생성, 5개 수정)
- 파일별 상세 변경사항
- Before/After 코드 비교
- 마이그레이션 경로
- API 엔드포인트 추가 현황
- 버그 수정 내역
- 다른 개발자용 체크리스트

**읽기**: [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)

---

## 🎯 상황별 문서 선택

### 상황 1: "이 프로젝트를 처음 받았어요"
→ **[빠른 시작 가이드](./QUICK_START.md)** 읽기

1. 프로젝트 설정 완료
2. API 테스트 (curl)
3. 브라우저에서 확인

---

### 상황 2: "API가 어떻게 동작하는지 알고 싶어요"
→ **[REST API 상세 구현 문서](./REST_API_IMPLEMENTATION.md)** 읽기

1. API 엔드포인트 명세 확인
2. 요청/응답 예시 보기
3. 인증 방식 이해
4. 테스트 방법 시연

---

### 상황 3: "코드 검토를 해야 해요"
→ **[변경 사항 요약](./CHANGES_SUMMARY.md)** 읽기

1. 변경 통계 확인
2. 파일별 Before/After 비교
3. 체크리스트로 검증

---

### 상황 4: "새로운 기능을 추가하고 싶어요"
→ 다음 순서로 읽기:

1. [REST API 상세 구현 문서](./REST_API_IMPLEMENTATION.md) - 기존 패턴 학습
2. `src/app/api/` 폴더의 기존 코드 참고
3. 같은 패턴으로 새 API 작성

---

## 📊 프로젝트 개요

### 프로젝트명
**Eatsy** - 카페 주문 관리 시스템

### 기술 스택
- **프레임워크**: Next.js 16
- **언어**: TypeScript
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (JWT)
- **스타일**: Tailwind CSS v4
- **상태 관리**: Zustand

### 주요 변경사항
**Server Actions 기반 → REST API 기반으로 전환**

| 항목 | 변경 전 | 변경 후 |
|------|--------|--------|
| 메뉴 페이지 | SSR (Server Component) | 클라이언트 (REST API) |
| API 접근 | 서버 전용 | HTTP 엔드포인트 |
| 클라이언트 지원 | 웹 브라우저만 | 웹 + 모바일 앱 + 외부 API |
| 테스트 | 통합 테스트만 | curl/Postman으로 단위 테스트 가능 |

---

## 🔍 파일 위치

### 문서
```
docs/
├── README.md                         ← 현재 파일
├── QUICK_START.md                    ← 빠른 시작 가이드
├── REST_API_IMPLEMENTATION.md        ← 상세 구현 문서
└── CHANGES_SUMMARY.md                ← 변경 사항 요약
```

### API 라우트
```
src/app/api/
├── categories/route.ts               ← 카테고리 목록
├── products/
│   ├── route.ts                      ← 상품 목록
│   └── [id]/route.ts                 ← 상품 상세
├── orders/
│   ├── route.ts                      ← 주문 생성/조회
│   └── [id]/route.ts                 ← 주문 상태 변경
├── members/
│   ├── me/route.ts                   ← 내 프로필
│   └── route.ts                      ← 회원 목록
├── inventory/
│   └── [productId]/route.ts          ← 재고 조정
├── sales/route.ts                    ← 매출 분석
└── notifications/
    └── logs/route.ts                 ← 알림 로그
```

### 라이브러리
```
src/lib/api/
├── response.ts                       ← 공통 응답 형식
└── auth.ts                           ← 인증/권한 검증

src/lib/utils/
└── image.ts                          ← 이미지 URL 정규화
```

### UI 컴포넌트
```
src/app/(main)/menu/
├── page.tsx                          ← 메뉴 목록 페이지
└── [id]/page.tsx                     ← 상품 상세 페이지

src/components/menu/
├── ProductCard.tsx                   ← 상품 카드
└── CategoryFilterClient.tsx          ← 카테고리 필터
```

---

## 🧪 API 엔드포인트 요약

### 공개 API (인증 불필요)
```
GET  /api/categories                  카테고리 목록
GET  /api/products                    상품 목록 (필터링 가능)
GET  /api/products/[id]               상품 상세
```

### 사용자 API (인증 필요)
```
GET  /api/orders                      내 주문 목록
POST /api/orders                      주문 생성
GET  /api/members/me                  내 프로필
PATCH /api/members/me                 프로필 수정
```

### 관리자 API (인증 + 권한 필요)
```
PATCH /api/orders/[id]                주문 상태 변경
GET  /api/members                     회원 목록
PATCH /api/inventory/[productId]      재고 조정
GET  /api/sales                       매출 데이터
GET  /api/notifications/logs          알림 로그
```

---

## ✅ 체크리스트

### 프로젝트 설정 후 확인사항

- [ ] `npm install` 완료
- [ ] `.env.local` 파일 생성 및 값 입력
- [ ] Supabase RLS 권한 설정 SQL 실행
- [ ] `npm run dev` 정상 실행
- [ ] `curl http://localhost:3000/api/categories` 응답 확인
- [ ] http://localhost:3000/menu 이미지 로드 확인
- [ ] 상품 카드 클릭해서 상세 페이지 로드 확인

### 코드 검토 후 확인사항

- [ ] 13개 파일 생성 확인
- [ ] 5개 파일 수정 확인
- [ ] API 응답 형식 통일 확인
- [ ] 인증/권한 검증 로직 확인
- [ ] 이미지 URL 정규화 적용 확인
- [ ] 에러 처리 일관성 확인

---

## 🚀 시작하기

### 1단계: 문서 읽기
```bash
# 빠른 시작 (5분)
cat QUICK_START.md

# 또는 전체 이해 (30분)
cat REST_API_IMPLEMENTATION.md
```

### 2단계: 프로젝트 설정
```bash
npm install
cp .env.example .env.local
# .env.local 값 입력

# Supabase RLS 권한 설정 (Supabase 대시보드 → SQL Editor)
# ... SQL 코드 실행
```

### 3단계: 개발 서버 시작
```bash
npm run dev
```

### 4단계: 확인
```bash
# 터미널
curl http://localhost:3000/api/categories

# 브라우저
http://localhost:3000/menu
```

---

## 📞 문제 해결

### 일반적인 문제와 해결책

| 문제 | 해결책 |
|------|--------|
| "permission denied for schema eatsy" | [QUICK_START.md](./QUICK_START.md#q1-permission-denied-for-schema-eatsy-에러가-나요) 참조 |
| 이미지가 안 보여요 | [QUICK_START.md](./QUICK_START.md#q2-이미지가-안-보여요) 참조 |
| 상품을 클릭해도 404 | [QUICK_START.md](./QUICK_START.md#q3-상품을-클릭해도-404가-나요) 참조 |
| API가 빈 배열 반환 | [QUICK_START.md](./QUICK_START.md#q4-상품이-나오지-않아요) 참조 |

더 자세한 설명은 각 문서의 "문제 해결 과정" 또는 "자주 묻는 질문" 섹션을 참고하세요.

---

## 📈 구현 통계

| 항목 | 개수 |
|------|------|
| 새로 생성된 파일 | 13개 |
| 수정된 파일 | 5개 |
| 생성된 API 엔드포인트 | 12개 |
| 생성된 페이지 | 1개 |
| 생성된 컴포넌트 | 1개 |
| 생성된 유틸 함수 | 3개 |
| **총 변경 파일** | **18개** |

---

## 📅 작업 완료 정보

- **작업 일자**: 2026-02-26
- **작업 기간**: 하루
- **최종 상태**: ✅ 완료 및 테스트 완료
- **배포 준비**: 준비 완료 (환경변수만 변경하면 됨)

---

## 🤝 문서 기여

이 문서를 개선하거나 추가할 사항이 있으면:

1. 각 문서에 오류나 누락이 있으면 수정
2. 새로운 API 추가 시 이 README 및 관련 문서 업데이트
3. 새로운 문제 발생 시 "자주 묻는 질문" 섹션에 추가

---

## 📚 참고 자료

### 공식 문서
- [Next.js 16 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)

### 프로젝트 설정
- [CLAUDE.md](../CLAUDE.md) - 프로젝트 아키텍처 및 컨벤션
- [next.config.ts](../next.config.ts) - Next.js 설정

---

## ✨ 마지막으로

이 문서들이 새로운 개발자분들이 빠르게 프로젝트에 기여할 수 있도록 도움이 되길 바랍니다.

**질문이 있거나 문제가 발생하면 해당 문서의 FAQ 또는 문제 해결 섹션을 먼저 확인해주세요!**

**Happy coding! 🎉**

---

**문서 작성일**: 2026-02-26
**마지막 수정일**: 2026-02-26

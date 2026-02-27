# GigaCoffee 카페 서비스 - 요구사항 문서

**버전:** v2.0
**작성일:** 2026-02-24
**기술 스택:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase + PortOne + Solapi + FCM

---

## 1. 서비스 개요

"GigaCoffee"은 카페 주문, 커뮤니티 게시판, 재고/매출 관리 기능을 통합한 온라인 카페 서비스입니다.

---

## 2. 기능 요구사항 (FR)

### FR-01. 인증 시스템

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01-1 | 이메일/비밀번호 회원가입 | 필수 |
| FR-01-2 | 이메일/비밀번호 로그인 | 필수 |
| FR-01-3 | 카카오 소셜 로그인 | 높음 |
| FR-01-4 | Google 소셜 로그인 | 높음 |
| FR-01-5 | 비밀번호 재설정 (이메일 링크) | 필수 |
| FR-01-6 | 로그아웃 | 필수 |
| FR-01-7 | 인증 추상화 레이어 (교체 가능한 설계) | 필수 |

**교체 가능 인증 시스템:** Supabase Auth → NextAuth / Auth0 / Clerk 교체 시 `src/lib/auth/index.ts`만 변경

### FR-02. 상품/메뉴

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-02-1 | 카테고리별 상품 목록 조회 | 필수 |
| FR-02-2 | 상품 상세 페이지 (옵션 선택) | 필수 |
| FR-02-3 | 상품 검색 | 높음 |
| FR-02-4 | 상품 이미지 업로드 (관리자) | 필수 |
| FR-02-5 | 품절 처리 | 필수 |

### FR-03. 주문/결제

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-03-1 | 장바구니 (옵션 포함, localStorage 영속) | 필수 |
| FR-03-2 | 주문 생성 | 필수 |
| FR-03-3 | PortOne 결제 연동 (카드/카카오페이/네이버페이/토스) | 필수 |
| FR-03-4 | 결제 검증 (서버사이드 금액 비교) | 필수 |
| FR-03-5 | 주문 취소/환불 | 높음 |
| FR-03-6 | 주문 내역 조회 | 필수 |
| FR-03-7 | 요청사항 입력 | 보통 |

### FR-04. 재고 관리 (NEW)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-04-1 | 상품별 재고 현황 조회 | 필수 |
| FR-04-2 | 재고 입고/수동조정 | 필수 |
| FR-04-3 | 재고 변동 이력 조회 (날짜/사유/담당자) | 필수 |
| FR-04-4 | 주문 완료 시 재고 자동 차감 | 필수 |
| FR-04-5 | 주문 취소 시 재고 자동 환원 | 필수 |
| FR-04-6 | 재고 부족 임계값 설정 | 필수 |
| FR-04-7 | 재고 부족 알림 발송 | 높음 |

**재고 자동 차감 트리거:** `orders.status = 'paid'` → `inventory.quantity` 차감 + `stock_histories` 기록

### FR-05. 매출 관리 (NEW)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-05-1 | 기간별 매출 조회 (오늘/이번주/이번달) | 필수 |
| FR-05-2 | KPI 카드: 총 매출, 주문 수, 평균 객단가 | 필수 |
| FR-05-3 | 일별 매출 추이 라인차트 (recharts) | 필수 |
| FR-05-4 | 상품별 매출 순위 바차트 | 높음 |
| FR-05-5 | 결제 수단별 비율 파이차트 | 높음 |
| FR-05-6 | CSV 다운로드 | 보통 |

### FR-06. 알림 시스템 (NEW)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-06-1 | 카카오 알림톡 발송 (솔라피) | 필수 |
| FR-06-2 | FCM 웹 푸시 발송 | 높음 |
| FR-06-3 | SMS 발송 (솔라피) | 높음 |
| FR-06-4 | 이벤트별 알림 자동 발송 | 필수 |
| FR-06-5 | 관리자 수동 알림 발송 | 보통 |
| FR-06-6 | 발송 이력 조회 | 필수 |

**알림 이벤트:**

| 이벤트 | 고객 알림 | 관리자 알림 |
|--------|-----------|-------------|
| ORDER_PAID | 카카오 + 푸시 | 푸시 |
| ORDER_PREPARING | 카카오 + 푸시 | - |
| ORDER_READY | 카카오 + 푸시 + SMS | - |
| ORDER_CANCELLED | 카카오 | - |
| LOW_STOCK | - | 푸시 |

### FR-07. 게시판

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-07-1 | 게시글 목록/상세 조회 | 필수 |
| FR-07-2 | 게시글 작성/수정/삭제 | 필수 |
| FR-07-3 | 댓글 작성/삭제 | 높음 |
| FR-07-4 | 공지사항 고정 (관리자) | 보통 |
| FR-07-5 | 게시글 숨김 (관리자) | 보통 |

### FR-08. 관리자

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-08-1 | 주문 상태 변경 | 필수 |
| FR-08-2 | 실시간 주문 현황 (Supabase Realtime) | 높음 |
| FR-08-3 | 회원 목록/관리 | 필수 |
| FR-08-4 | 역할 관리 (admin/staff/member) | 필수 |
| FR-08-5 | 대시보드 KPI 카드 | 필수 |

---

## 3. 비기능 요구사항 (NFR)

### NFR-01. 반응형 디자인

| 항목 | 사용자 페이지 | 관리자 페이지 |
|------|--------------|--------------|
| 대상 | 웹 + 모바일 | 웹 전용 (lg: 1024px↑) |
| 하단 탭바 | 모바일 전용 | 없음 |
| 상품 그리드 | 2열(모바일) → 4열(데스크탑) | - |
| 카테고리 | 수평 스크롤 pill | - |
| 모바일 미지원 | - | "PC에서 접속해주세요" 배너 |

**Tailwind 브레이크포인트:** `sm(640px)` / `md(768px)` / `lg(1024px)`

### NFR-02. 성능

- Next.js Image 최적화 (`next/image`, WebP 자동 변환)
- 서버 컴포넌트 우선 (`"use client"` 최소화)
- Supabase Row Level Security (RLS) 활성화
- 정적 자산 1년 캐싱 (nginx)

### NFR-03. 보안

- 환경변수를 통한 시크릿 관리 (`.env.local`)
- Supabase RLS로 데이터 접근 제어
- 서버사이드 결제 금액 검증 (클라이언트 변조 방지)
- 관리자 라우트 미들웨어 보호

### NFR-04. 인증 교체 가능성

```
현재: Supabase Auth (SupabaseAuthProvider)
교체 시: src/lib/auth/index.ts의 export만 변경
나머지 코드 무변경 (AuthProvider 인터페이스 준수)
```

### NFR-05. 배포

- Docker 멀티스테이지 빌드 (node:20-alpine)
- nginx 리버스 프록시 (정적 캐싱, 보안 헤더)
- GitHub Actions CI/CD (PR: tsc+lint+build, main: Vercel+GHCR)

---

## 4. DB 스키마

### 주요 테이블

```sql
-- 재고 관리 (NEW)
CREATE TABLE inventory (
  product_id UUID PRIMARY KEY REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 재고 변동 이력 (NEW)
CREATE TYPE stock_history_type AS ENUM ('in', 'out', 'adjust', 'cancel');
CREATE TABLE stock_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  change_qty INT NOT NULL,
  reason TEXT,
  type stock_history_type NOT NULL,
  ref_order_id UUID REFERENCES orders(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 발송 이력 (NEW)
CREATE TYPE notification_channel AS ENUM ('kakao', 'push', 'sms');
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_channel NOT NULL,
  recipient_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로필에 FCM 토큰 추가 (NEW)
ALTER TABLE profiles ADD COLUMN fcm_token TEXT;
```

### 재고 자동 차감 트리거 (Supabase SQL)

```sql
CREATE OR REPLACE FUNCTION auto_deduct_inventory()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- order_items를 순회하며 inventory 차감
    UPDATE inventory i
    SET quantity = i.quantity - oi.quantity,
        updated_at = NOW()
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = i.product_id;

    -- stock_histories 기록
    INSERT INTO stock_histories (product_id, change_qty, type, ref_order_id)
    SELECT product_id, -quantity, 'out', NEW.id
    FROM order_items WHERE order_id = NEW.id;
  END IF;

  IF NEW.status = 'cancelled' AND OLD.status = 'paid' THEN
    -- 재고 환원
    UPDATE inventory i
    SET quantity = i.quantity + oi.quantity,
        updated_at = NOW()
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = i.product_id;

    INSERT INTO stock_histories (product_id, change_qty, type, ref_order_id)
    SELECT product_id, quantity, 'cancel', NEW.id
    FROM order_items WHERE order_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_deduct_inventory
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION auto_deduct_inventory();
```

---

## 5. 환경변수 목록

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# PortOne
NEXT_PUBLIC_PORTONE_IMP_CODE=
PORTONE_API_KEY=
PORTONE_API_SECRET=

# 솔라피 (카카오 알림톡 + SMS)
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_FROM_NUMBER=
SOLAPI_KAKAO_CHANNEL_ID=

# Firebase FCM
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. 검증 체크리스트

- [ ] `npm run dev` → 로컬 정상 기동
- [ ] 회원가입 → profiles 자동 생성, fcm_token 등록 확인
- [ ] 상품 주문 결제 → inventory 자동 차감 + stock_histories 기록 확인
- [ ] 주문 완료 → 카카오 알림톡/푸시 수신 확인
- [ ] 재고 임계값 이하 → 관리자 푸시 알림 확인
- [ ] `/admin/sales` → 매출 차트 정상 렌더링 확인
- [ ] 모바일 뷰포트 → 하단 탭바, 2열 그리드 정상 표시 확인
- [ ] `src/lib/auth/index.ts` provider 교체 → 기능 정상 동작 확인
- [ ] `docker compose up` → 컨테이너 정상 기동
- [ ] PR → GitHub Actions CI 통과

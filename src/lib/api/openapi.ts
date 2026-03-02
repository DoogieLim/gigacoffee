/**
 * GigaCoffee OpenAPI 3.0 스펙 정의
 *
 * 이 파일이 API 문서의 단일 진실 소스(Single Source of Truth)다.
 * 새 엔드포인트 추가 시 반드시 이 파일도 함께 업데이트한다.
 *
 * 문서 확인: http://localhost:3000/api-docs (개발) | https://gigacoffee.vercel.app/api-docs (프로덕션)
 */

/** 공통 응답 스키마 - 모든 성공/실패 응답이 이 포맷을 따른다 */
const commonSchemas = {
  // GET 단건/목록 성공 응답
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { description: "엔드포인트마다 다른 응답 데이터" },
    },
  },
  // 페이지네이션 응답 (알림 로그 등)
  PaginatedResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { type: "array" },
      pagination: {
        type: "object",
        properties: {
          total: { type: "integer", example: 100 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          pages: { type: "integer", example: 5 },
        },
      },
    },
  },
  // 에러 응답
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "에러 메시지" },
    },
  },
  // 상품 스키마
  Product: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "아이스 아메리카노" },
      description: { type: "string", nullable: true },
      price: { type: "integer", example: 4500 },
      image_url: { type: "string", nullable: true },
      is_available: { type: "boolean" },
      category_id: { type: "string", format: "uuid" },
      category: {
        type: "object",
        nullable: true,
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "커피" },
        },
      },
    },
  },
  // 카테고리 스키마
  Category: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "커피" },
      sort_order: { type: "integer", example: 1 },
      is_active: { type: "boolean" },
    },
  },
  // 주문 아이템 스키마
  OrderItem: {
    type: "object",
    properties: {
      product_id: { type: "string", format: "uuid" },
      product_name: { type: "string", example: "아이스 아메리카노" },
      quantity: { type: "integer", example: 2 },
      price: { type: "integer", example: 4500, description: "기본 단가 (옵션 제외)" },
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", example: "샷 추가" },
            price_delta: { type: "integer", example: 500 },
          },
        },
      },
      line_total: { type: "integer", example: 10000 },
    },
  },
  // 주문 스키마
  Order: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      user_id: { type: "string", format: "uuid" },
      status: {
        type: "string",
        enum: ["pending", "paid", "preparing", "out_for_delivery", "ready", "completed", "cancelled"],
      },
      delivery_type: {
        type: "string",
        enum: ["pickup", "robot", "rider"],
      },
      delivery_address: {
        type: "object",
        nullable: true,
        properties: {
          street: { type: "string" },
          detail: { type: "string" },
        },
      },
      delivery_fee: { type: "integer", example: 3000 },
      total_amount: { type: "integer", example: 13000 },
      memo: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      order_items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
    },
  },
  // 재고 스키마
  Inventory: {
    type: "object",
    properties: {
      product_id: { type: "string", format: "uuid" },
      product_name: { type: "string", example: "아이스 아메리카노" },
      quantity: { type: "integer", example: 50 },
      low_stock_threshold: { type: "integer", example: 10 },
      updated_at: { type: "string", format: "date-time" },
    },
  },
  // 회원 프로필 스키마
  Profile: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      email: { type: "string", format: "email" },
      name: { type: "string" },
      phone: { type: "string", nullable: true },
      avatar_url: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
    },
  },
}

/** 공통 헤더 - Supabase Auth 쿠키 기반 인증 */
const bearerAuth = {
  BearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "Supabase Auth JWT. 브라우저에서는 쿠키로 자동 처리. " +
      "직접 호출 시 Authorization: Bearer <access_token> 헤더 사용.",
  },
}

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "GigaCoffee API",
    version: "1.0.0",
    description:
      "GigaCoffee 프랜차이즈 카페 서비스 REST API.\n\n" +
      "## 인증\n" +
      "대부분의 엔드포인트는 Supabase Auth JWT를 사용한다. " +
      "브라우저에서는 쿠키로 자동 처리되며, 직접 호출 시 `Authorization: Bearer <access_token>` 헤더가 필요하다.\n\n" +
      "## 권한 등급\n" +
      "- **Public**: 인증 불필요\n" +
      "- **User**: 로그인 사용자\n" +
      "- **Admin/Staff**: 관리자 또는 스태프 권한\n" +
      "- **Admin Only**: 관리자(admin) 권한만\n" +
      "- **Franchise Admin**: 프랜차이즈 전체 관리자 권한\n\n" +
      "## 응답 포맷\n" +
      "성공: `{ success: true, data: ... }` | 에러: `{ success: false, error: '...' }`\n\n" +
      "## 아키텍처 참고\n" +
      "- DB 접근은 Repository 패턴 경유 (supabase.from() 직접 호출 금지)\n" +
      "- 사용자 데이터 변경은 Server Actions 우선 사용, REST API는 외부 연동/키오스크 전용",
    contact: {
      name: "GigaCoffee Dev Team",
    },
  },
  servers: [
    {
      url: "https://gigacoffee.vercel.app",
      description: "프로덕션",
    },
    {
      url: "http://localhost:3000",
      description: "로컬 개발",
    },
  ],
  tags: [
    { name: "Products", description: "상품 조회 및 검색" },
    { name: "Categories", description: "카테고리" },
    { name: "Orders", description: "주문 생성 및 조회" },
    { name: "Payment", description: "PortOne v2 결제 처리" },
    { name: "Inventory", description: "재고 관리 (관리자)" },
    { name: "Sales", description: "매출 분석 (관리자)" },
    { name: "Members", description: "회원 관리" },
    { name: "Notifications", description: "알림 발송 및 로그" },
    { name: "Posts", description: "게시판 파일 업로드" },
    { name: "Admin", description: "관리자 전용 기능" },
    { name: "User", description: "사용자 설정" },
    { name: "Test", description: "테스트 엔드포인트 (개발환경 전용)" },
  ],
  components: {
    securitySchemes: bearerAuth,
    schemas: commonSchemas,
  },
  paths: {
    // ─────────────────────────────────────────
    // Products
    // ─────────────────────────────────────────
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "상품 목록 조회",
        description:
          "판매 가능한 상품 목록을 반환한다. `categoryId`로 특정 카테고리만 필터링할 수 있다.\n\n" +
          "`availableOnly: true`가 기본 적용되어 비활성화 상품은 제외된다.",
        parameters: [
          {
            name: "categoryId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
            description: "카테고리 UUID로 필터링",
          },
        ],
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Product" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          500: { description: "서버 오류" },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "상품 단건 조회",
        description: "UUID로 특정 상품을 조회한다.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "상품 UUID",
          },
        ],
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      properties: {
                        data: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { description: "상품 없음" },
          500: { description: "서버 오류" },
        },
      },
    },
    "/api/products/search": {
      get: {
        tags: ["Products"],
        summary: "자연어 시맨틱 검색",
        description:
          "Gemini Flash로 자연어 의도를 파싱 후 임베딩 유사도 검색을 수행한다.\n\n" +
          "**처리 흐름:**\n" +
          "1. Gemini Flash가 쿼리를 파싱 → `{ semanticQuery, priceRange, categoryHint, sortBy }`\n" +
          "2. LLM 실패 시 regex fallback 파서 사용 (서비스 가용성 보장)\n" +
          "3. semanticQuery + categoryHint로 Gemini embedding-001(768차원) 벡터 생성\n" +
          "4. product_embeddings 테이블에서 코사인 유사도 계산 (float4[] 직렬화 문제로 TypeScript 계산)\n" +
          "5. 가격 범위 필터 → 정렬 적용\n\n" +
          "**주의:** 가격 필터 적용 시 limit×5만큼 먼저 조회 후 클라이언트에서 필터링한다.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: { type: "string" },
            example: "5000원 이하 달콤한 음료",
            description: "자연어 검색 쿼리",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10, maximum: 50 },
            description: "반환할 최대 결과 수 (최대 50)",
          },
        ],
        responses: {
          200: {
            description: "성공 - 유사도 순 정렬된 상품 목록",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Product" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: "검색어(q) 누락" },
          500: { description: "Gemini API 오류 또는 서버 오류" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Categories
    // ─────────────────────────────────────────
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "활성 카테고리 목록",
        description: "`is_active: true`인 카테고리만 반환한다. `sort_order` 오름차순 정렬.",
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Category" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    // ─────────────────────────────────────────
    // Orders
    // ─────────────────────────────────────────
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "내 주문 목록 조회",
        description: "로그인 사용자 본인의 주문 목록을 반환한다. 최신순 정렬.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      properties: {
                        data: { type: "array", items: { $ref: "#/components/schemas/Order" } },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: "미인증" },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "주문 생성",
        description:
          "장바구니 내용으로 새 주문을 생성한다.\n\n" +
          "**주의:** 이 엔드포인트는 주문 레코드만 생성한다 (status=`pending`). " +
          "결제 완료는 `/api/payment/complete`가 별도 처리한다.\n\n" +
          "**배달 유형별 배달비:**\n" +
          "- `pickup`: 배달비 없음\n" +
          "- `robot` / `rider`: delivery_settings 테이블에서 실시간 조회 (클라이언트 전달값 무시, 서버 재검증)\n\n" +
          "**금액 계산:** `(기본가 + 옵션 합산) × 수량`으로 서버에서 재계산하여 가격 조작을 방지한다.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items"],
                properties: {
                  items: {
                    type: "array",
                    minItems: 1,
                    items: {
                      type: "object",
                      required: ["product_id", "product_name", "quantity", "price", "options"],
                      properties: {
                        product_id: { type: "string", format: "uuid" },
                        product_name: { type: "string" },
                        quantity: { type: "integer", minimum: 1 },
                        price: { type: "integer", description: "기본 단가" },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              price_delta: { type: "integer" },
                            },
                          },
                        },
                      },
                    },
                  },
                  delivery_type: {
                    type: "string",
                    enum: ["pickup", "robot", "rider"],
                    default: "pickup",
                  },
                  delivery_address: {
                    type: "object",
                    nullable: true,
                    properties: {
                      street: { type: "string" },
                      detail: { type: "string" },
                    },
                  },
                  memo: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "주문 생성 완료 (결제 전 pending 상태)",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      properties: { data: { $ref: "#/components/schemas/Order" } },
                    },
                  ],
                },
              },
            },
          },
          400: { description: "배달 서비스 비활성화 상태" },
          401: { description: "미인증" },
          500: { description: "서버 오류" },
        },
      },
    },
    "/api/orders/{id}": {
      patch: {
        tags: ["Orders"],
        summary: "주문 상태 변경 (관리자)",
        description:
          "관리자/스태프가 주문 상태를 변경한다. 상태 변경 시 고객에게 알림(카카오/푸시/SMS)이 발송된다.\n\n" +
          "**상태 전이 규칙** (애플리케이션 레벨 강제):\n" +
          "- `paid` → `preparing` → `ready`(픽업) 또는 `out_for_delivery`(배달) → `completed`\n" +
          "- 어느 상태에서든 `cancelled` 가능\n\n" +
          "**알림 이벤트 매핑:**\n" +
          "- `paid` → ORDER_PAID / `preparing` → ORDER_PREPARING / `ready` → ORDER_READY / `cancelled` → ORDER_CANCELLED",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "주문 UUID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["paid", "preparing", "out_for_delivery", "ready", "completed", "cancelled"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "상태 변경 완료" },
          400: { description: "status 값 누락" },
          401: { description: "미인증" },
          403: { description: "권한 부족 (admin/staff 필요)" },
          500: { description: "서버 오류" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Payment
    // ─────────────────────────────────────────
    "/api/payment/prepare": {
      post: {
        tags: ["Payment"],
        summary: "결제 준비 (PortOne SDK 초기화용)",
        description:
          "PortOne 브라우저 SDK에 전달할 결제 파라미터를 반환한다.\n\n" +
          "**흐름:** 클라이언트 → 이 API → PortOne SDK → 결제창 표시\n\n" +
          "주문 소유권 검증(order.user_id === 로그인 사용자)을 서버에서 수행하여 타인 결제를 방지한다.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["order_id"],
                properties: {
                  order_id: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "PortOne SDK 파라미터",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    paymentId: { type: "string", description: "PortOne 결제 ID (= order_id 재사용)" },
                    amount: { type: "integer" },
                    orderName: { type: "string", example: "GigaCoffee 주문" },
                    customerName: { type: "string" },
                    customerEmail: { type: "string" },
                    customerPhone: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
          401: { description: "미인증" },
          403: { description: "타인의 주문" },
          404: { description: "주문 없음" },
        },
      },
    },
    "/api/payment/complete": {
      post: {
        tags: ["Payment"],
        summary: "결제 완료 검증 및 확정",
        description:
          "PortOne SDK 결제 완료 후 서버에서 검증한다.\n\n" +
          "**보안 중요:** 클라이언트가 보낸 금액을 신뢰하지 않고 PortOne 서버에서 직접 조회해 검증한다.\n\n" +
          "**처리 순서 (장애 안전성 고려):**\n" +
          "1. PortOne API로 결제 상태 조회 → PAID 확인\n" +
          "2. DB 주문 금액 vs PortOne 결제 금액 비교 → 불일치 시 자동 취소\n" +
          "3. payments 테이블 INSERT + orders.status = 'paid' 업데이트 (DB 실패 시 자동 취소)\n" +
          "4. 고객 알림 발송 + 관리자 신규주문 알림 (실패해도 주문은 완료 처리)\n\n" +
          "**자동 취소 시나리오:** 금액 불일치 또는 DB 저장 실패 시 PortOne cancelPayment 자동 호출.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["paymentId", "txId", "order_id"],
                properties: {
                  paymentId: { type: "string", description: "PortOne 결제 ID" },
                  txId: { type: "string", description: "PortOne 거래 ID" },
                  order_id: { type: "string", format: "uuid" },
                  item_count: { type: "integer", description: "관리자 알림용 아이템 수 (선택)" },
                  delivery_type: {
                    type: "string",
                    enum: ["pickup", "robot", "rider"],
                    description: "관리자 알림용 배달 유형 (선택)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "결제 확정 완료", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } } },
          400: { description: "결제 미완료 또는 금액 불일치 (자동 취소됨)" },
          500: { description: "DB 저장 실패 (자동 취소됨)" },
        },
      },
    },
    "/api/payment/cancel": {
      post: {
        tags: ["Payment"],
        summary: "결제 취소 (고객 요청)",
        description:
          "고객이 직접 결제 취소를 요청한다.\n\n" +
          "결제 완료(paid) 상태인 경우에만 PortOne cancelPayment를 호출한다. " +
          "미결제(pending) 주문은 결제 취소 없이 orders.status만 'cancelled'로 변경한다.\n\n" +
          "**관리자 취소:** 이 엔드포인트 대신 Server Action `updateOrderStatus(id, 'cancelled')` 사용.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["order_id"],
                properties: {
                  order_id: { type: "string", format: "uuid" },
                  reason: { type: "string", default: "고객 요청 취소" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "취소 완료" },
          401: { description: "미인증" },
          403: { description: "타인의 주문" },
          404: { description: "주문 없음" },
          500: { description: "서버 오류" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Inventory
    // ─────────────────────────────────────────
    "/api/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "전체 재고 목록",
        description: "모든 상품의 재고 현황을 반환한다. 인증 불필요 (관리자 페이지에서 SSR로 직접 호출).",
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Inventory" },
                },
              },
            },
          },
        },
      },
    },
    "/api/inventory/{productId}": {
      patch: {
        tags: ["Inventory"],
        summary: "재고 수동 조정 (관리자)",
        description:
          "관리자/스태프가 특정 상품의 재고를 수동으로 설정한다.\n\n" +
          "**입력값:** 최종 수량 (변화량이 아님). 예: 현재 5개 → 10개로 설정 시 `quantity: 10`\n" +
          "변화량(`changeQty = 목표수량 - 현재수량`)은 서버가 계산하여 `stock_histories`에 기록한다.\n\n" +
          "**주의:** 판매에 의한 자동 차감은 DB 트리거가 처리. 이 API는 입고/실사 조정 전용.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: {
                  quantity: { type: "integer", minimum: 0, description: "조정 후 최종 수량" },
                  reason: { type: "string", default: "수동 조정", description: "이력 기록용 사유" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        productId: { type: "string" },
                        quantity: { type: "integer" },
                        changeQty: { type: "integer", description: "실제 변화량 (음수=감소)" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "quantity 누락 또는 타입 오류" },
          401: { description: "미인증" },
          403: { description: "권한 부족" },
          404: { description: "상품 없음" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Sales
    // ─────────────────────────────────────────
    "/api/sales": {
      get: {
        tags: ["Sales"],
        summary: "매출 분석 데이터 (관리자)",
        description:
          "기간별 매출 통계를 반환한다. 관리자 대시보드 차트에 사용.\n\n" +
          "**period 계산 기준:**\n" +
          "- `today`: 당일 00:00:00부터 현재\n" +
          "- `week`: 7일 전부터 현재\n" +
          "- `month`: 30일 전부터 현재",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "period",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["today", "week", "month"], default: "today" },
          },
        ],
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        period: { type: "string" },
                        fromDate: { type: "string", format: "date-time" },
                        toDate: { type: "string", format: "date-time" },
                        totalSales: { type: "integer", description: "총 매출액(원)" },
                        totalOrders: { type: "integer" },
                        paidOrders: { type: "integer" },
                        completedOrders: { type: "integer" },
                        salesByDate: {
                          type: "object",
                          additionalProperties: {
                            type: "object",
                            properties: {
                              total: { type: "integer" },
                              count: { type: "integer" },
                            },
                          },
                          example: { "2026-03-02": { total: 125000, count: 28 } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "미인증" },
          403: { description: "권한 부족 (admin 전용)" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Members
    // ─────────────────────────────────────────
    "/api/members": {
      get: {
        tags: ["Members"],
        summary: "전체 회원 목록 (관리자)",
        description: "가입한 모든 회원 목록을 반환한다. admin 권한 전용.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    { properties: { data: { type: "array", items: { $ref: "#/components/schemas/Profile" } } } },
                  ],
                },
              },
            },
          },
          401: { description: "미인증" },
          403: { description: "권한 부족" },
        },
      },
    },
    "/api/members/me": {
      get: {
        tags: ["Members"],
        summary: "내 프로필 조회",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    { properties: { data: { $ref: "#/components/schemas/Profile" } } },
                  ],
                },
              },
            },
          },
          401: { description: "미인증" },
          404: { description: "프로필 없음" },
        },
      },
      patch: {
        tags: ["Members"],
        summary: "내 프로필 수정",
        description:
          "변경할 필드만 포함하면 된다. 미포함 필드는 기존 값 유지.\n\n" +
          "`fcm_token`은 브라우저 FCM 초기화 시 자동 갱신된다 (사용자 직접 입력 불필요).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  phone: { type: "string", example: "010-1234-5678" },
                  avatar_url: { type: "string", format: "uri" },
                  fcm_token: { type: "string", description: "Firebase Cloud Messaging 토큰 (브라우저 자동 갱신)" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "수정 완료 - 수정된 프로필 반환" },
          400: { description: "수정할 필드 없음" },
          401: { description: "미인증" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Notifications
    // ─────────────────────────────────────────
    "/api/notifications/send": {
      post: {
        tags: ["Notifications"],
        summary: "알림 발송",
        description:
          "지정 사용자에게 알림을 발송한다. 내부 서버 간 호출 또는 관리자 수동 발송용.\n\n" +
          "**발송 채널:** 이벤트 타입에 따라 카카오 알림톡 / SMS / FCM 웹 푸시 중 해당 채널로 발송.\n" +
          "`channels` 파라미터로 특정 채널만 지정 가능.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["recipientId", "eventType"],
                properties: {
                  recipientId: { type: "string", format: "uuid", description: "수신자 사용자 ID" },
                  eventType: {
                    type: "string",
                    enum: ["ORDER_PAID", "ORDER_PREPARING", "ORDER_READY", "ORDER_CANCELLED", "LOW_STOCK"],
                  },
                  channels: {
                    type: "array",
                    items: { type: "string", enum: ["kakao", "sms", "push"] },
                    description: "지정하지 않으면 이벤트 기본 채널 사용",
                  },
                  data: {
                    type: "object",
                    description: "알림 템플릿 변수",
                    example: { orderId: "AB123456" },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "발송 완료 - 각 채널별 결과 반환" },
          401: { description: "미인증" },
        },
      },
    },
    "/api/notifications/logs": {
      get: {
        tags: ["Notifications"],
        summary: "알림 발송 로그 (관리자)",
        description: "알림 발송 이력을 페이지네이션으로 반환한다. page, limit 파라미터 지원.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 } },
        ],
        responses: {
          200: {
            description: "성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" },
              },
            },
          },
          401: { description: "미인증" },
          403: { description: "권한 부족" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Posts
    // ─────────────────────────────────────────
    "/api/posts/upload": {
      post: {
        tags: ["Posts"],
        summary: "게시글 이미지 업로드",
        description:
          "Supabase Storage `post-images` 버킷에 이미지를 업로드하고 공개 URL을 반환한다.\n\n" +
          "- 최대 파일 크기: 5MB\n" +
          "- 허용 타입: image/* (JPEG, PNG, GIF, WebP 등)\n" +
          "- 저장 경로: `post-images/{userId}/{timestamp}_{원본파일명}`",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "업로드 완료",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: { url: { type: "string", format: "uri" } },
                    },
                  },
                },
              },
            },
          },
          400: { description: "파일 없음 / 이미지가 아님 / 5MB 초과" },
          401: { description: "미인증" },
          500: { description: "Supabase Storage 업로드 실패" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Admin
    // ─────────────────────────────────────────
    "/api/admin/sync-embeddings": {
      post: {
        tags: ["Admin"],
        summary: "상품 임베딩 일괄 동기화 (관리자)",
        description:
          "모든 상품에 대해 Gemini embedding-001 벡터를 생성하여 `product_embeddings` 테이블에 저장한다.\n\n" +
          "**실행 시점:** 최초 배포 후 또는 임베딩 모델 변경 시 1회 실행.\n" +
          "신규 상품 등록 시에는 상품 등록 Server Action에서 자동 생성.\n\n" +
          "**주의:** Gemini API 할당량 소모 주의. 상품 수가 많을 경우 시간이 걸릴 수 있음.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "동기화 완료",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    total: { type: "integer" },
                    synced: { type: "integer" },
                    failed: { type: "integer" },
                    errors: { type: "array", items: { type: "string" }, nullable: true },
                  },
                },
              },
            },
          },
          401: { description: "미인증" },
          403: { description: "권한 부족" },
        },
      },
    },
    "/api/admin/set-store": {
      post: {
        tags: ["Admin"],
        summary: "관리자 활성 매장 전환 (franchise_admin)",
        description:
          "franchise_admin이 관리자 대시보드에서 조회할 매장을 전환한다.\n\n" +
          "`storeId: null`이면 '전체 보기' 모드 (모든 매장 합산). " +
          "선택된 매장 ID는 `admin_store_id` HttpOnly 쿠키에 저장된다 (30일).\n\n" +
          "**권한:** franchise_admin만 호출 가능 (store_admin은 자신의 매장 고정).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["storeId"],
                properties: {
                  storeId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description: "매장 UUID. null이면 전체 보기 모드",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "쿠키 설정 완료" },
          401: { description: "미인증" },
          403: { description: "franchise_admin 권한 없음" },
        },
      },
    },
    // ─────────────────────────────────────────
    // User
    // ─────────────────────────────────────────
    "/api/user/set-store": {
      post: {
        tags: ["User"],
        summary: "사용자 선택 매장 설정",
        description:
          "사용자가 `/stores` 페이지에서 매장을 선택할 때 호출된다.\n\n" +
          "선택된 매장 ID는 `user_store_id` HttpOnly 쿠키에 저장된다 (30일). " +
          "주문 생성 시 이 쿠키 값이 `orders.store_id`에 사용된다.\n\n" +
          "**인증 불필요:** 비로그인 사용자도 매장 선택 가능 (로그인 후 주문 시 사용됨).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  storeId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description: "매장 UUID. null 또는 빈 문자열이면 쿠키 삭제",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "쿠키 설정 완료" },
        },
      },
    },
    // ─────────────────────────────────────────
    // Test
    // ─────────────────────────────────────────
    "/api/test/notifications": {
      get: {
        tags: ["Test"],
        summary: "알림 채널 테스트 (개발 전용)",
        description:
          "SMS / 카카오 알림톡 / FCM 푸시 발송을 테스트한다.\n\n" +
          "**프로덕션에서는 403 반환.** `NODE_ENV=development`에서만 작동.\n\n" +
          "FCM 테스트 시 `userId` 파라미터가 있어야 DB에서 fcm_token을 조회한다. " +
          "fcm_token이 없으면 브라우저에서 `/my` 페이지 방문 후 알림 권한 허용 필요.",
        parameters: [
          {
            name: "channel",
            in: "query",
            schema: { type: "string", enum: ["sms", "kakao", "push", "all"], default: "all" },
          },
          { name: "phone", in: "query", schema: { type: "string" }, description: "테스트 수신 전화번호 (없으면 ADMIN_PHONE 환경변수 사용)" },
          { name: "userId", in: "query", schema: { type: "string", format: "uuid" }, description: "FCM 푸시 테스트용 사용자 ID" },
        ],
        responses: {
          200: { description: "테스트 결과 (채널별 성공/실패 상세)" },
          400: { description: "phone 파라미터 누락 + ADMIN_PHONE 미설정" },
          403: { description: "프로덕션 환경에서 비활성화" },
        },
      },
    },
  },
}

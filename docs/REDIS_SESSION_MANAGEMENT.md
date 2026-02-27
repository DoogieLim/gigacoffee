# Redis 세션 관리 가이드

Redis를 사용한 무료 세션 관리 구현 가이드입니다.

---

## 📋 개요

### 아키텍처
```
사용자 로그인
  ↓
세션 생성 (UUID)
  ↓
Redis에 저장 (7일 TTL)
  ↓
쿠키에 세션ID 저장
  ↓
요청 시 세션ID로 Redis 조회
```

### 특징
- ✅ 완전 무료 (Docker)
- ✅ 다중 인스턴스 공유 가능
- ✅ 자동 만료 (7일)
- ✅ 영구 저장 (AOF 활성화)

---

## 🚀 설치 및 실행

### 1단계: Docker Compose 시작
```bash
docker-compose up -d
```

**확인**:
```bash
# Redis 연결 확인
docker exec insaeng-gomins-redis redis-cli ping
# 응답: PONG
```

### 2단계: npm 패키지 설치
```bash
npm install redis
```

---

## 💻 사용법

### 1. 로그인 시 세션 저장

```typescript
import { saveSession } from '@/lib/redis'
import { v4 as uuidv4 } from 'uuid'

export async function loginAction(email: string, password: string) {
  // 사용자 인증 로직
  const user = await authenticateUser(email, password)

  // 세션 생성
  const sessionId = uuidv4()

  // Redis에 저장
  await saveSession(sessionId, {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    loginTime: new Date().toISOString(),
  })

  // 쿠키에 저장 (클라이언트 측)
  cookies().set('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, // 7일
  })

  return { success: true, sessionId }
}
```

---

### 2. 세션 확인

```typescript
import { getSession } from '@/lib/redis'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const sessionId = (await cookies()).get('sessionId')?.value

  if (!sessionId) {
    return null
  }

  const session = await getSession(sessionId)

  if (!session) {
    return null
  }

  // 세션 갱신 (TTL 리셋)
  await refreshSession(sessionId)

  return session
}
```

---

### 3. 로그아웃 시 세션 삭제

```typescript
import { deleteUserSessions } from '@/lib/redis'
import { cookies } from 'next/headers'

export async function logoutAction(userId: string) {
  // Redis에서 사용자의 모든 세션 삭제
  await deleteUserSessions(userId)

  // 쿠키 삭제
  (await cookies()).delete('sessionId')

  return { success: true }
}
```

---

### 4. 캐싱 예시

```typescript
import { getCache, setCacheWithTTL } from '@/lib/redis'

// 상품 목록 캐싱 (30분)
export async function getProductsWithCache() {
  const cacheKey = 'products:list'

  // 캐시에서 먼저 확인
  let products = await getCache(cacheKey)

  if (!products) {
    // 캐시 미스 - 데이터베이스에서 조회
    products = await productRepo.findAll()

    // Redis에 저장 (30분)
    await setCacheWithTTL(cacheKey, products, 30 * 60)
  }

  return products
}
```

---

### 5. 조회 수 카운팅

```typescript
import { incrementCounter, getCounter } from '@/lib/redis'

// 상품 조회 시 조회 수 증가
export async function viewProduct(productId: string) {
  const product = await productRepo.findById(productId)

  // 조회 수 증가
  const views = await incrementCounter(`product:${productId}:views`)

  return { product, views }
}

// 조회 수 조회
export async function getProductViews(productId: string) {
  return await getCounter(`product:${productId}:views`)
}
```

---

## 🔧 API 라우트에서 사용

### 인증 미들웨어

```typescript
// src/lib/api/auth-redis.ts
import { getSession } from '@/lib/redis'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { apiError } from './response'

export async function getAuthUserFromRedis(request: NextRequest) {
  const sessionId = (await cookies()).get('sessionId')?.value

  if (!sessionId) {
    throw apiError('인증이 필요합니다', 401)
  }

  const session = await getSession(sessionId)

  if (!session) {
    throw apiError('세션이 만료되었습니다', 401)
  }

  return session
}
```

### API 라우트에서 사용

```typescript
// src/app/api/members/me/route.ts
import { getAuthUserFromRedis } from '@/lib/api/auth-redis'
import { apiSuccess, apiError } from '@/lib/api/response'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRedis(request)

    return apiSuccess({
      id: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return apiError('오류 발생', 500)
  }
}
```

---

## 📊 성능 최적화

### 1. 세션 갱신 전략

```typescript
// 마지막 갱신 후 1시간이 지났을 때만 갱신
const REFRESH_THRESHOLD = 60 * 60 * 1000 // 1시간

export async function maybeRefreshSession(sessionId: string) {
  const session = await getSession(sessionId)

  if (!session) return null

  const lastRefresh = session.lastRefresh || session.loginTime
  const now = new Date().getTime()

  if (now - new Date(lastRefresh).getTime() > REFRESH_THRESHOLD) {
    session.lastRefresh = new Date().toISOString()
    await saveSession(sessionId, session)
  }

  return session
}
```

### 2. 배치 캐시 갱신

```typescript
import { setCacheWithTTL } from '@/lib/redis'

// 매 시간마다 자주 조회되는 데이터 갱신
export async function refreshHotCache() {
  const products = await productRepo.findAll()
  await setCacheWithTTL('products:list', products, 60 * 60)

  const categories = await categoryRepo.findAll()
  await setCacheWithTTL('categories:list', categories, 60 * 60)
}
```

---

## 🐛 문제 해결

### Redis 연결 오류

```bash
# Redis 상태 확인
docker-compose ps

# Redis 로그 확인
docker logs insaeng-gomins-redis

# Redis CLI로 직접 확인
docker exec insaeng-gomins-redis redis-cli
> PING
PONG

> INFO
# Redis 정보 출력
```

### 세션이 저장되지 않음

```typescript
// 디버그: Redis 연결 확인
const redis = await getRedisClient()
const testKey = 'test:key'
await redis.set(testKey, 'test_value')
const value = await redis.get(testKey)
console.log('Redis test:', value) // 'test_value'
```

---

## 📈 모니터링

### Redis 메모리 사용량 확인

```bash
docker exec insaeng-gomins-redis redis-cli INFO memory
```

### 세션 개수 확인

```bash
docker exec insaeng-gomins-redis redis-cli KEYS "session:*" | wc -l
```

### 캐시 크기 확인

```bash
docker exec insaeng-gomins-redis redis-cli DBSIZE
```

---

## 🚀 스케일아웃 시

여러 Next.js 인스턴스가 같은 Redis를 사용하면:

```yaml
# docker-compose.yml
nextjs1:
  environment:
    - REDIS_URL=redis://redis:6379
nextjs2:
  environment:
    - REDIS_URL=redis://redis:6379
nextjs3:
  environment:
    - REDIS_URL=redis://redis:6379
```

모든 인스턴스가 같은 세션을 공유합니다! ✅

---

## 📚 다른 무료 옵션

### Upstash (100% 무료)
```
- 10,000 명령어/일 무료
- 무제한 저장소
- URL: https://upstash.com
```

**Upstash 설정**:
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
```

---

## ✅ 체크리스트

- [ ] Docker Compose에 Redis 추가됨
- [ ] npm install redis 완료
- [ ] Redis 클라이언트 생성됨
- [ ] 세션 저장/조회 함수 구현됨
- [ ] 로그인/로그아웃에 적용됨
- [ ] 테스트 완료 (로그인 → 세션 확인 → 로그아웃)
- [ ] 캐싱 구현됨 (선택사항)

---

**완전 무료이면서도 프로덕션 수준의 세션 관리 준비 완료!** 🎉

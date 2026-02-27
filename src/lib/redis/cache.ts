import { getRedisClient } from './client'

const CACHE_PREFIX = 'cache:'

/**
 * 캐시에 데이터 저장
 */
export async function setCacheWithTTL(
  key: string,
  value: any,
  ttlSeconds: number = 3600 // 1시간
): Promise<void> {
  const redis = await getRedisClient()
  const cacheKey = `${CACHE_PREFIX}${key}`

  await redis.setEx(cacheKey, ttlSeconds, JSON.stringify(value))
}

/**
 * 캐시에서 데이터 조회
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = await getRedisClient()
  const cacheKey = `${CACHE_PREFIX}${key}`

  const data = await redis.get(cacheKey)
  if (!data) {
    return null
  }

  return JSON.parse(data) as T
}

/**
 * 캐시 삭제
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = await getRedisClient()
  const cacheKey = `${CACHE_PREFIX}${key}`

  await redis.del(cacheKey)
}

/**
 * 패턴 기반 캐시 삭제
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  const redis = await getRedisClient()
  const cachePattern = `${CACHE_PREFIX}${pattern}`

  const keys = await redis.keys(cachePattern)
  if (keys.length > 0) {
    await redis.del(keys)
  }
}

/**
 * 캐시 초기화 (모든 캐시 삭제)
 */
export async function flushCache(): Promise<void> {
  const redis = await getRedisClient()
  const pattern = `${CACHE_PREFIX}*`

  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(keys)
  }
}

/**
 * 조회 수 증가 (게시물, 상품 등)
 */
export async function incrementCounter(key: string): Promise<number> {
  const redis = await getRedisClient()
  const counterKey = `counter:${key}`

  return await redis.incr(counterKey)
}

/**
 * 조회 수 감소
 */
export async function decrementCounter(key: string): Promise<number> {
  const redis = await getRedisClient()
  const counterKey = `counter:${key}`

  return await redis.decr(counterKey)
}

/**
 * 조회 수 조회
 */
export async function getCounter(key: string): Promise<number> {
  const redis = await getRedisClient()
  const counterKey = `counter:${key}`

  const value = await redis.get(counterKey)
  return value ? parseInt(value, 10) : 0
}

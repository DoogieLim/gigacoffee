import { getRedisClient } from './client'

export interface SessionData {
  userId: string
  email: string
  name: string
  role?: string
  [key: string]: any
}

const SESSION_PREFIX = 'session:'
const SESSION_TTL = 7 * 24 * 60 * 60 // 7일 (초)

/**
 * 세션을 Redis에 저장
 */
export async function saveSession(sessionId: string, data: SessionData): Promise<void> {
  const redis = await getRedisClient()
  const key = `${SESSION_PREFIX}${sessionId}`

  await redis.setEx(key, SESSION_TTL, JSON.stringify(data))
}

/**
 * Redis에서 세션 조회
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  const redis = await getRedisClient()
  const key = `${SESSION_PREFIX}${sessionId}`

  const data = await redis.get(key)
  if (!data) {
    return null
  }

  return JSON.parse(data) as SessionData
}

/**
 * 세션 삭제
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const redis = await getRedisClient()
  const key = `${SESSION_PREFIX}${sessionId}`

  await redis.del(key)
}

/**
 * 세션 갱신 (TTL 리셋)
 */
export async function refreshSession(sessionId: string): Promise<void> {
  const redis = await getRedisClient()
  const key = `${SESSION_PREFIX}${sessionId}`

  await redis.expire(key, SESSION_TTL)
}

/**
 * 사용자의 모든 세션 조회
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
  const redis = await getRedisClient()
  const pattern = `${SESSION_PREFIX}*`

  const keys = await redis.keys(pattern)
  const sessions: SessionData[] = []

  for (const key of keys) {
    const data = await redis.get(key)
    if (data) {
      const session = JSON.parse(data) as SessionData
      if (session.userId === userId) {
        sessions.push(session)
      }
    }
  }

  return sessions
}

/**
 * 사용자의 모든 세션 삭제 (로그아웃)
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  const redis = await getRedisClient()
  const pattern = `${SESSION_PREFIX}*`

  const keys = await redis.keys(pattern)

  for (const key of keys) {
    const data = await redis.get(key)
    if (data) {
      const session = JSON.parse(data) as SessionData
      if (session.userId === userId) {
        await redis.del(key)
      }
    }
  }
}

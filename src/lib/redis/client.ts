let redisClient: any = null

export async function getRedisClient() {
  if (redisClient) {
    return redisClient
  }

  // Return mock client - Redis not installed
  // To use Redis, install: npm install redis
  console.warn('Redis not available, using mock implementation')
  redisClient = {
    get: async () => null,
    set: async () => {},
    del: async () => {},
    exists: async () => false,
  }

  return redisClient
}

export async function closeRedisClient() {
  if (redisClient && redisClient.quit) {
    await redisClient.quit()
    redisClient = null
  }
}

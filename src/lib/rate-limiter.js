/**
 * Rate limiting utility
 */

export class RateLimiter {
  constructor(env) {
    this.env = env;
  }

  async checkLimit(identifier, limit = 60, window = 60) {
    const key = `rate_limit:${identifier}`;
    const count = await this.env.ABOGADO_WILSON_KV.get(key);
    
    if (!count) {
      await this.env.ABOGADO_WILSON_KV.put(key, '1', { expirationTtl: window });
      return true;
    }

    const currentCount = parseInt(count);
    if (currentCount >= limit) {
      return false;
    }

    await this.env.ABOGADO_WILSON_KV.put(key, String(currentCount + 1), { expirationTtl: window });
    return true;
  }

  async reset(identifier) {
    const key = `rate_limit:${identifier}`;
    await this.env.ABOGADO_WILSON_KV.delete(key);
  }
}

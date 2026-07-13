interface RateLimiter {
  /** Returns true if the request under `key` is allowed, false if it should be rejected. */
  consume(key: string): boolean;
}

/**
 * Fixed-window rate limiter kept in process memory. Correct for a single
 * long-lived Node.js server; on serverless platforms with multiple
 * concurrent instances each instance enforces its own window, so the
 * effective global limit is (perInstanceLimit * instanceCount). Swap in a
 * shared store (e.g. Upstash Redis) behind this same interface if that
 * becomes a problem.
 */
class InMemoryRateLimiter implements RateLimiter {
  private hits = new Map<string, { count: number; windowStart: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string): boolean {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.hits.set(key, { count: 1, windowStart: now });
      return true;
    }

    if (entry.count >= this.limit) {
      return false;
    }

    entry.count += 1;
    return true;
  }
}

// 10 attempts per 10 minutes per key (IP + email combination) for auth endpoints.
export const authRateLimiter: RateLimiter = new InMemoryRateLimiter(10, 10 * 60 * 1000);

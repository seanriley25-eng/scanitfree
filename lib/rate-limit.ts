const requests = new Map<string, { count: number; resetAt: number }>();

const LIMITS = {
  windowMs: 24 * 60 * 60 * 1000,
  maxRequests: 15,
};

export function rateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  if (Math.random() < 0.01) {
    for (const [key, val] of requests) {
      if (now > val.resetAt) requests.delete(key);
    }
  }
  const entry = requests.get(ip);
  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + LIMITS.windowMs });
    return { allowed: true, remaining: LIMITS.maxRequests - 1, resetAt: now + LIMITS.windowMs };
  }
  if (entry.count >= LIMITS.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: LIMITS.maxRequests - entry.count, resetAt: entry.resetAt };
}
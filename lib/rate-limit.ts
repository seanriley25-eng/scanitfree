const requests = new Map<string, { count: number; resetAt: number }>();

const MAX = 15;
const WINDOW = 24 * 60 * 60 * 1000;

export function rateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  requests.forEach((val, key) => {
    if (now > val.resetAt) requests.delete(key);
  });

  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW });
    return { allowed: true, remaining: MAX - 1, resetAt: now + WINDOW };
  }

  if (entry.count >= MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: MAX - entry.count, resetAt: entry.resetAt };
}
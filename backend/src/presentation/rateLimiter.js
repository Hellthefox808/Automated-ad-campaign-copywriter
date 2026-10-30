export function createRateLimiter ({ windowMs = 60000, maxRequests = 120 } = {}) {
  const ipHits = new Map()

  // Periodic cleanup of expired windows
  setInterval(() => {
    const now = Date.now()
    for (const [ip, data] of ipHits.entries()) {
      if (now - data.resetTime > windowMs) {
        ipHits.delete(ip)
      }
    }
  }, windowMs).unref()

  return function rateLimiter (req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1'
    const now = Date.now()

    let record = ipHits.get(ip)
    if (!record || now - record.resetTime > windowMs) {
      record = { count: 1, resetTime: now }
      ipHits.set(ip, record)
    } else {
      record.count++
    }

    res.setHeader('X-RateLimit-Limit', maxRequests)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count))
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.resetTime + windowMs) / 1000))

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again later.',
        retryAfterSec: Math.ceil((record.resetTime + windowMs - now) / 1000)
      })
    }

    next()
  }
}


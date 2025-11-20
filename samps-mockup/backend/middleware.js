const rateLimit = new Map();
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW) || 900000; // 15 min
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

const getRateLimitKey = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

const checkRateLimit = (req) => {
  const key = getRateLimitKey(req);
  const now = Date.now();
  
  if (!rateLimit.has(key)) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  const limit = rateLimit.get(key);
  
  if (now > limit.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
};

module.exports = (req, res, next) => {
  // Rate limiting
  if (!checkRateLimit(req)) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      retryAfter: Math.ceil((rateLimit.get(getRateLimitKey(req)).resetTime - Date.now()) / 1000)
    });
  }
  
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // CORS headers (más restrictivo)
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Input sanitization
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  // Middleware para simular OTP
  if (req.method === 'POST' && req.url === '/generate-otp') {
    const otp = Math.floor(100000 + Math.random() * 900000);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n*** OTP para alumno ${req.body?.rut || 'N/A'}: ${otp} ***\n`);
    }
    res.json({ otp, success: true });
    return;
  }
  
  next();
};

function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key]
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .substring(0, 1000);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
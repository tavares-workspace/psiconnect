function sanitizeString(val) {
  if (typeof val !== 'string') return val;
  return val
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '');
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    clean[key] = typeof val === 'string' ? sanitizeString(val) : val;
  }
  return clean;
}

function sanitize(req, res, next) {
  if (req.body) req.body = sanitizeObject(req.body);
  next();
}

module.exports = sanitize;

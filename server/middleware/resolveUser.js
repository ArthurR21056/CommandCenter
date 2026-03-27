const db = require('../db/database');

/**
 * Reads X-User-Id from request headers and attaches the resolved integer
 * user ID to req.userId. Returns 401 if the header is missing or invalid.
 *
 * This is the single enforcement point for user identity. Every /api route
 * can trust req.userId without re-checking.
 */
function resolveUser(req, res, next) {
  const clientKey = req.headers['x-user-id'];

  if (!clientKey) {
    return res.status(401).json({ error: 'Missing X-User-Id header' });
  }

  const user = db.prepare('SELECT id FROM users WHERE client_key = ?').get(clientKey);

  if (!user) {
    return res.status(401).json({ error: 'Unknown user. Call /api/users/ensure first.' });
  }

  req.userId = user.id;
  next();
}

module.exports = resolveUser;

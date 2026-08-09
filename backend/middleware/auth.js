import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aidsync_jwt_signing_secret_987654321';

// Custom lightweight cookie parser to avoid installing additional npm dependencies
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
};

export const verifySoftAuth = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.authToken || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }
  next();
};

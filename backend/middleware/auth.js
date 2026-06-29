import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aidsync_jwt_signing_secret_987654321';

export const verifySoftAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }
  next();
};

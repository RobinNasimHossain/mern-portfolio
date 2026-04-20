import { HttpError } from '../utils/httpError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { User } from '../models/User.js';

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw new HttpError(401, 'Authentication required');
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') throw new HttpError(401, 'Invalid token');
    const user = await User.findById(payload.sub).lean();
    if (!user) throw new HttpError(401, 'User no longer exists');
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Insufficient permissions'));
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');

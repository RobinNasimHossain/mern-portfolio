import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, type: 'access' },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessTtl },
  );
}

export function signRefreshToken(user, tokenVersion) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      type: 'refresh',
      tv: tokenVersion ?? user.tokenVersion ?? 0,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshTtl },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

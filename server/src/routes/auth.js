import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  }),
});

const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10) }),
});

function issueTokens(user) {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw new HttpError(409, 'Email already registered');

    const isFirstUser = (await User.estimatedDocumentCount()) === 0;
    const user = new User({ name, email, role: isFirstUser ? 'admin' : 'user' });
    await user.setPassword(password);
    await user.save();

    const tokens = issueTokens(user);
    res.status(201).json({ user: user.toSafeJSON(), ...tokens });
  }),
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw new HttpError(401, 'Invalid credentials');
    const ok = await user.verifyPassword(password);
    if (!ok) throw new HttpError(401, 'Invalid credentials');

    const tokens = issueTokens(user);
    res.json({ user: user.toSafeJSON(), ...tokens });
  }),
);

router.post(
  '/refresh',
  authLimiter,
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== 'refresh') throw new HttpError(401, 'Invalid token');

    const user = await User.findById(payload.sub);
    if (!user) throw new HttpError(401, 'User no longer exists');
    if ((user.tokenVersion ?? 0) !== (payload.tv ?? 0)) {
      throw new HttpError(401, 'Refresh token revoked');
    }

    res.json({ user: user.toSafeJSON(), ...issueTokens(user) });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ user: user.toSafeJSON() });
  }),
);

router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Bump tokenVersion so existing refresh tokens become invalid.
    await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
    res.json({ message: 'Logged out' });
  }),
);

router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) throw new HttpError(404, 'User not found');
    const ok = await user.verifyPassword(currentPassword);
    if (!ok) throw new HttpError(400, 'Current password is incorrect');

    await user.setPassword(newPassword);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    res.json({ message: 'Password updated', ...issueTokens(user) });
  }),
);

export default router;

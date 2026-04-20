import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Message } from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many contact requests from this IP, try again later.' },
});

const messageBody = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().max(200).default(''),
  body: z.string().min(2).max(5000),
});

router.post(
  '/',
  contactLimiter,
  validate(z.object({ body: messageBody })),
  asyncHandler(async (req, res) => {
    const msg = await Message.create(req.body);
    res.status(201).json({ message: 'Message received', id: msg._id });
  }),
);

router.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const items = await Message.find().sort({ createdAt: -1 });
    res.json({ items });
  }),
);

router.patch(
  '/:id/read',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true },
    );
    if (!msg) throw new HttpError(404, 'Message not found');
    res.json({ message: msg });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) throw new HttpError(404, 'Message not found');
    res.json({ message: 'Deleted' });
  }),
);

export default router;

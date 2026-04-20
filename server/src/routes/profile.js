import { Router } from 'express';
import { z } from 'zod';
import { Profile } from '../models/Profile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const profileBody = z
  .object({
    name: z.string().min(1).max(160),
    headline: z.string().max(200),
    summary: z.string().max(1000),
    about: z.string().max(10000),
    location: z.string().max(160),
    avatarUrl: z.string().url().or(z.literal('')),
    resumeUrl: z.string().url().or(z.literal('')),
    email: z.string().email().or(z.literal('')),
    socials: z
      .object({
        github: z.string().url().or(z.literal('')).optional(),
        linkedin: z.string().url().or(z.literal('')).optional(),
        twitter: z.string().url().or(z.literal('')).optional(),
        website: z.string().url().or(z.literal('')).optional(),
      })
      .partial()
      .optional(),
    skills: z.array(z.string()),
    experience: z.array(
      z.object({
        role: z.string(),
        company: z.string(),
        start: z.string(),
        end: z.string().default(''),
        description: z.string().default(''),
      }),
    ),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        start: z.string(),
        end: z.string().default(''),
      }),
    ),
  })
  .partial();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const profile =
      (await Profile.findOne({ key: 'singleton' })) ||
      (await Profile.create({ key: 'singleton' }));
    res.json({ profile });
  }),
);

router.put(
  '/',
  requireAuth,
  requireAdmin,
  validate(z.object({ body: profileBody })),
  asyncHandler(async (req, res) => {
    const profile = await Profile.findOneAndUpdate(
      { key: 'singleton' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true },
    );
    res.json({ profile });
  }),
);

export default router;

import { Router } from 'express';
import slugify from 'slugify';
import { z } from 'zod';
import { Project } from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const projectBody = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(200).optional(),
  summary: z.string().min(2).max(320),
  description: z.string().default(''),
  tech: z.array(z.string()).default([]),
  coverImage: z.string().url().or(z.literal('')).default(''),
  repoUrl: z.string().url().or(z.literal('')).default(''),
  liveUrl: z.string().url().or(z.literal('')).default(''),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { featured } = req.query;
    const filter = {};
    if (featured === 'true') filter.featured = true;
    const items = await Project.find(filter).sort({ featured: -1, order: 1, createdAt: -1 });
    res.json({ items });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) throw new HttpError(404, 'Project not found');
    res.json({ project });
  }),
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(z.object({ body: projectBody })),
  asyncHandler(async (req, res) => {
    const data = req.body;
    if (!data.slug) data.slug = slugify(data.title, { lower: true, strict: true });
    const project = await Project.create(data);
    res.status(201).json({ project });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(z.object({ body: projectBody.partial() })),
  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) throw new HttpError(404, 'Project not found');
    res.json({ project });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) throw new HttpError(404, 'Project not found');
    res.json({ message: 'Project deleted' });
  }),
);

export default router;

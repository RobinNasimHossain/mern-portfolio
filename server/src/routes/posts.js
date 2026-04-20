import { Router } from 'express';
import slugify from 'slugify';
import { z } from 'zod';
import { Post } from '../models/Post.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const postBody = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(220).optional(),
  excerpt: z.string().max(320).default(''),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().url().or(z.literal('')).default(''),
  published: z.boolean().default(false),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { tag, includeDrafts } = req.query;
    const filter = {};
    if (includeDrafts !== 'true') filter.published = true;
    if (tag) filter.tags = tag;
    const items = await Post.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .populate('author', 'name');
    res.json({ items });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name');
    if (!post) throw new HttpError(404, 'Post not found');
    res.json({ post });
  }),
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(z.object({ body: postBody })),
  asyncHandler(async (req, res) => {
    const data = { ...req.body, author: req.user.id };
    if (!data.slug) data.slug = slugify(data.title, { lower: true, strict: true });
    if (data.published && !data.publishedAt) data.publishedAt = new Date();
    const post = await Post.create(data);
    res.status(201).json({ post });
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(z.object({ body: postBody.partial() })),
  asyncHandler(async (req, res) => {
    const update = { ...req.body };
    if (update.published === true) {
      const existing = await Post.findById(req.params.id);
      if (existing && !existing.publishedAt) update.publishedAt = new Date();
    }
    const post = await Post.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!post) throw new HttpError(404, 'Post not found');
    res.json({ post });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) throw new HttpError(404, 'Post not found');
    res.json({ message: 'Post deleted' });
  }),
);

export default router;

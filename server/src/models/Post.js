import mongoose from 'mongoose';
import slugify from 'slugify';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: '', maxlength: 320 },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    coverImage: { type: String, default: '' },
    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

postSchema.pre('validate', function ensureSlug(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export const Post = mongoose.model('Post', postSchema);

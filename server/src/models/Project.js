import mongoose from 'mongoose';
import slugify from 'slugify';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, required: true, maxlength: 320 },
    description: { type: String, default: '' },
    tech: { type: [String], default: [] },
    coverImage: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

projectSchema.pre('validate', function ensureSlug(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export const Project = mongoose.model('Project', projectSchema);

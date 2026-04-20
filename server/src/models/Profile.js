import mongoose from 'mongoose';

// Single-document collection describing the portfolio owner.
const profileSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'singleton', unique: true },
    name: { type: String, default: 'Robin Nasim Hossain' },
    headline: { type: String, default: 'Full-Stack Software Engineer' },
    summary: { type: String, default: '' },
    about: { type: String, default: '' },
    location: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    email: { type: String, default: '' },
    socials: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    skills: { type: [String], default: [] },
    experience: {
      type: [
        {
          role: String,
          company: String,
          start: String,
          end: String,
          description: String,
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          school: String,
          degree: String,
          start: String,
          end: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const Profile = mongoose.model('Profile', profileSchema);

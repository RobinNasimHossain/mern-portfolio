import mongoose from 'mongoose';
import { config } from './config/env.js';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { Post } from './models/Post.js';
import { Profile } from './models/Profile.js';

const projects = [
  {
    title: 'Shoreline Bank',
    slug: 'shoreline-bank',
    summary: 'Full-stack MERN retail banking simulator with atomic transactions.',
    description:
      'Multi-account banking app demonstrating integer-cents ledger semantics, ' +
      'atomic MongoDB guards for overdraft prevention, and compensating refund ' +
      'logic for failed transfers. Includes JWT auth and a React dashboard.',
    tech: ['React', 'Vite', 'Tailwind', 'Express', 'MongoDB', 'JWT'],
    repoUrl: 'https://github.com/RobinNasimHossain/mern',
    featured: true,
    order: 1,
  },
  {
    title: 'Shoply — MERN E-commerce',
    slug: 'shoply-mern-ecommerce',
    summary: 'Production-ready MERN e-commerce with Stripe checkout.',
    description:
      'Persistent cart, server-side price recalculation, Stripe webhook ' +
      'integration, and an admin-ready CMS. CI pipeline runs ESLint and ' +
      'build checks on every push.',
    tech: ['React', 'Express', 'MongoDB', 'Stripe', 'Tailwind'],
    repoUrl: 'https://github.com/RobinNasimHossain/mern-ecommerce',
    featured: true,
    order: 2,
  },
  {
    title: 'Ecommerce Shop (FastAPI + React)',
    slug: 'ecommerce-shop-fastapi',
    summary:
      'Decoupled FastAPI + SQLModel backend with a React/TypeScript storefront.',
    description:
      'Reference architecture for a FastAPI + React commerce site with JWT auth, ' +
      'multi-step checkout, and a seeded product catalog.',
    tech: ['FastAPI', 'SQLModel', 'React', 'TypeScript', 'Tailwind'],
    repoUrl: 'https://github.com/RobinNasimHossain/ecommerce-shop',
    featured: true,
    order: 3,
  },
];

const profileDoc = {
  key: 'singleton',
  name: 'Robin Nasim Hossain',
  headline: 'Full-Stack Software Engineer · MERN · TypeScript · Cloud',
  summary:
    'Self-taught software engineer building production-grade web apps. ' +
    'Focused on React, Node.js, TypeScript, and distributed systems.',
  about:
    "I'm Robin Nasim Hossain, a self-taught full-stack engineer. I love shipping " +
    'clean, reliable software — from banking ledgers to e-commerce checkout ' +
    'flows. Recently I have been building MERN apps with a strong emphasis on ' +
    'security, testability, and CI/CD.',
  location: 'Bangladesh',
  avatarUrl: '',
  email: 'mdnasimh040@gmail.com',
  socials: {
    github: 'https://github.com/RobinNasimHossain',
    linkedin: '',
    twitter: '',
    website: '',
  },
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'MongoDB',
    'MySQL',
    'Tailwind CSS',
    'FastAPI',
    'Python',
    'Git & GitHub',
    'REST APIs',
    'JWT Auth',
    'CI/CD',
  ],
  experience: [
    {
      role: 'Full-Stack Engineer',
      company: 'Freelance / Open-source',
      start: '2023',
      end: 'Present',
      description:
        'Built MERN and FastAPI applications including banking simulators, ' +
        'e-commerce platforms, and portfolio sites.',
    },
  ],
  education: [],
};

async function run() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log('[seed] connected to', config.mongoUri.replace(/\/\/.*@/, '//***@'));

  // 1. Admin user
  let admin = await User.findOne({ email: config.seed.adminEmail }).select('+passwordHash');
  if (!admin) {
    admin = new User({
      name: config.seed.adminName,
      email: config.seed.adminEmail,
      role: 'admin',
    });
    await admin.setPassword(config.seed.adminPassword);
    await admin.save();
    console.log('[seed] created admin', admin.email);
  } else {
    admin.role = 'admin';
    await admin.save();
    console.log('[seed] admin already exists:', admin.email);
  }

  // 2. Profile
  await Profile.findOneAndUpdate(
    { key: 'singleton' },
    { $set: profileDoc },
    { upsert: true, new: true },
  );
  console.log('[seed] upserted profile');

  // 3. Projects
  for (const p of projects) {
    await Project.findOneAndUpdate({ slug: p.slug }, { $set: p }, { upsert: true, new: true });
  }
  console.log(`[seed] upserted ${projects.length} projects`);

  // 4. Welcome blog post
  await Post.findOneAndUpdate(
    { slug: 'hello-world' },
    {
      $set: {
        title: 'Hello, world — I am Robin Nasim Hossain',
        slug: 'hello-world',
        excerpt:
          'An introduction to who I am, what I build, and what you can expect from this blog.',
        content:
          "# Hello, world\n\nI'm Robin Nasim Hossain — a self-taught full-stack engineer. " +
          "This blog is where I'll share what I'm learning and building.\n\n" +
          '## What to expect\n\n- MERN & TypeScript deep dives\n' +
          '- Architecture notes from real projects\n- Build logs & retros\n',
        tags: ['intro', 'mern'],
        published: true,
        publishedAt: new Date(),
        author: admin._id,
      },
    },
    { upsert: true, new: true },
  );
  console.log('[seed] upserted welcome post');

  await mongoose.connection.close();
  console.log('[seed] done');
}

run().catch(async (err) => {
  console.error('[seed] failed', err);
  try {
    await mongoose.connection.close();
  } catch {
    /* noop */
  }
  process.exit(1);
});

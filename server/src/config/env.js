import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(
    `[config] Missing required env vars: ${missing.join(', ')}. ` +
      'Copy server/.env.example to server/.env and fill in values.',
  );
  process.exit(1);
}

export const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@robinnasim.dev',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe!2025',
    adminName: process.env.SEED_ADMIN_NAME || 'Robin Nasim Hossain',
  },
});

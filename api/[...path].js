import mongoose from 'mongoose';
import { createApp } from '../server/src/app.js';

let cachedApp;
let dbConnectPromise;

function connectDb() {
  if (!dbConnectPromise) {
    mongoose.set('strictQuery', true);
    dbConnectPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
      })
      .catch((err) => {
        dbConnectPromise = undefined;
        throw err;
      });
  }
  return dbConnectPromise;
}

export default async function handler(req, res) {
  try {
    await connectDb();
  } catch (err) {
    console.error('[api] db connect failed', err);
    res.status(503).json({ message: 'Database unavailable' });
    return;
  }
  if (!cachedApp) cachedApp = createApp();
  return cachedApp(req, res);
}

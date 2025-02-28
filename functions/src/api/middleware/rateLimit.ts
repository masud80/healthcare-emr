import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

const WINDOW_SIZE_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKeyData = req['apiKeyData'];
    if (!apiKeyData) {
      res.status(500).json({ error: 'API key data not found' });
      return;
    }

    const rateLimit = admin.firestore().collection('rateLimits').doc(apiKeyData.id);
    
    // Use transaction to ensure atomic updates
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimit);
      const now = Date.now();
      
      if (!doc.exists) {
        transaction.set(rateLimit, {
          requests: 1,
          windowStart: now
        });
        return { allowed: true };
      }

      const data = doc.data()!;
      
      // Check if we're in a new window
      if (now - data.windowStart > WINDOW_SIZE_MS) {
        transaction.set(rateLimit, {
          requests: 1,
          windowStart: now
        });
        return { allowed: true };
      }

      // Check if we're over the limit
      if (data.requests >= MAX_REQUESTS_PER_WINDOW) {
        return { allowed: false };
      }

      // Increment request count
      transaction.update(rateLimit, {
        requests: admin.firestore.FieldValue.increment(1)
      });
      
      return { allowed: true };
    });

    if (!result.allowed) {
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate Limiting Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

export interface ApiKey {
  id: string;
  organizationId: string;
  scopes: string[];
  createdAt: Date;
  lastUsed: Date;
}

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.get('X-API-Key');
    
    if (!apiKey) {
      res.status(401).json({ error: 'API key is required' });
      return;
    }

    const apiKeyDoc = await admin
      .firestore()
      .collection('apiKeys')
      .doc(apiKey)
      .get();

    if (!apiKeyDoc.exists) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    const apiKeyData = apiKeyDoc.data() as ApiKey;
    
    // Update last used timestamp
    await apiKeyDoc.ref.update({
      lastUsed: admin.firestore.FieldValue.serverTimestamp()
    });

    // Attach API key data to request for later use
    req['apiKeyData'] = apiKeyData;
    
    next();
  } catch (error) {
    console.error('API Authentication Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 
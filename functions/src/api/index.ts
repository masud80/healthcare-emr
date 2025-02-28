import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import swaggerUi from 'swagger-ui-express';
import { validateApiKey } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimit';
import { ApiKey } from './middleware/auth';
import { swaggerDocument } from './swagger';

// Extend Express Request type to include apiKeyData
declare global {
  namespace Express {
    interface Request {
      apiKeyData: ApiKey;
    }
  }
}

const app = express();

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// Set up base path
const router = express.Router();
app.use('/external', router);

// Middleware
router.use(cors());
router.use(express.json());

// Debug logging for router
router.use((req, res, next) => {
  console.log(`Router handling: ${req.method} ${req.path}`);
  next();
});

// Swagger documentation - no auth required
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));

// Protected routes
router.use('/patients', validateApiKey as express.RequestHandler, rateLimiter as express.RequestHandler);
router.use('/records', validateApiKey as express.RequestHandler, rateLimiter as express.RequestHandler);

// Health check endpoint (no auth required)
router.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'healthy' });
});

// Patient data endpoints
router.get('/patients/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const apiKeyData = req['apiKeyData'];

    // Check if API key has required scope
    if (!apiKeyData.scopes.includes('patients:read')) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const patientDoc = await admin
      .firestore()
      .collection('patients')
      .doc(id)
      .get();

    if (!patientDoc.exists) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Remove sensitive information based on scope
    const patientData = patientDoc.data();
    if (patientData) {
      delete patientData.ssn;
      delete patientData.financialInfo;
      res.json(patientData);
    } else {
      res.status(404).json({ error: 'Patient data not found' });
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Medical records endpoints
router.post('/records/share', async (req: express.Request, res: express.Response) => {
  try {
    const { patientId, recordIds, recipientOrganizationId } = req.body;
    const apiKeyData = req['apiKeyData'];

    // Validate request
    if (!patientId || !recordIds || !Array.isArray(recordIds) || !recipientOrganizationId) {
      res.status(400).json({ error: 'Invalid request parameters' });
      return;
    }

    // Check permissions
    if (!apiKeyData.scopes.includes('records:share')) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Create sharing record
    const shareRecord = {
      patientId,
      recordIds,
      sourceOrganizationId: apiKeyData.organizationId,
      recipientOrganizationId,
      sharedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    };

    const shareRef = await admin
      .firestore()
      .collection('recordShares')
      .add(shareRecord);

    // Trigger background job to process sharing
    await admin.firestore().collection('jobs').add({
      type: 'PROCESS_RECORD_SHARE',
      shareId: shareRef.id,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      shareId: shareRef.id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error sharing records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the Express app as a Firebase Function
export const externalApi = functions.https.onRequest(app); 
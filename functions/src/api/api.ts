import * as cors from 'cors';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use((req, res, next) => {
  const now = admin.firestore.Timestamp.now().toDate();
  functions.logger.info(`new request received (${req.method}) at ${now}`);

  next();
});

app.get('/', (req, res) => res.json({ message: 'api root! 🥳' }));

app.get('/screams', async (req, res) => {
  try {
    const { docs } = await db.collection('screams').orderBy('createdAt', 'desc').get();
    return res.json({ screams: docs.map((d) => d.data()) });
  } catch (ex) {
    return res.status(500).json(toJsonError(ex));
  }
});

app.post('/scream', async (req, res) => {
  try {
    const scream = {
      ...req.body,
      createdAt: admin.firestore.Timestamp.now()
    };

    const result = await db.collection('screams').add(scream);
    return res.json({ message: `scream created (${result.id})` });
  } catch (ex) {
    return res.status(500).json(toJsonError(ex));
  }
});

export const api = functions.region('europe-west1').https.onRequest(app);

function toJsonError(ex: Error) {
  return { error: { name: ex.name, message: ex.message, stack: ex.stack } };
}

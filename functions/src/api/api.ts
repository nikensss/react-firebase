import * as cors from 'cors';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const app = express();

app.use(cors({ origin: true }));
app.use((req, res, next) => {
  const now = admin.firestore.Timestamp.now().toDate();
  functions.logger.info(`new request received (${req.method}) at ${now}`);

  next();
});

app.get('/', (req, res) => res.json({ message: 'api root! 🥳' }));

app.get('/screams', (req, res) => res.json({ screams: [] }));

export { app };

import * as cors from 'cors';
import * as express from 'express';
import firebase from 'firebase';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { isEmail, isEmpty, toJsonError } from '../utils';

firebase.initializeApp({
  apiKey: 'AIzaSyCsFsDU3ZszJp20phd3iErQmRdUI6RDU6E',
  authDomain: 'react-firebase-4283b.firebaseapp.com',
  projectId: 'react-firebase-4283b',
  storageBucket: 'react-firebase-4283b.appspot.com',
  messagingSenderId: '1033277610291',
  appId: '1:1033277610291:web:d325edb38f8f35a8514646',
  measurementId: 'G-B4HXZCVVG4'
});

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
    return res.json({
      screams: docs.map((d) => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt.toDate() }))
    });
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

app.post('/signup', async (req, res) => {
  const user = req.body;

  const errors: Record<string, string> = {};
  if (isEmpty(user.email)) {
    errors.email = 'Must not be empty';
  } else if (!isEmail(user.email)) {
    errors.email = 'Invalid email address';
  }

  if (isEmpty(user.password)) errors.password = 'Must not be empty';
  if (user.password !== user.confirmPassword) errors.confirmPassword = 'Password must match';
  if (isEmpty(user.handle)) errors.handle = 'Must not be empty';

  if (Object.keys(errors).length > 0) return res.status(401).json(errors);

  try {
    const userDoc = await db.collection('users').doc(user.handle).get();
    if (userDoc.exists) {
      return res.status(401).json({ handle: `handle ${user.handle} already in use` });
    }

    const data = await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
    if (!data.user) throw new Error('Could not sign up user!');

    await userDoc.ref.set({
      email: user.email,
      handle: user.handle,
      userId: data.user.uid,
      createdAt: admin.firestore.Timestamp.now()
    });

    return res.status(201).json({
      message: `user ${data.user.email} signed up successfully!`,
      token: await data.user.getIdToken()
    });
  } catch (ex) {
    const error = toJsonError(ex);
    functions.logger.error(`could not register user ${user.email}`, {
      ...req.body,
      ...error
    });

    if (error.error.message.includes('email address is already in use')) {
      return res.status(401).json({ email: error });
    }

    return res.status(500).json(error);
  }
});

app.post('/login', async (req, res) => {
  const user = req.body;

  const errors: Record<string, string> = {};

  if (isEmpty(user.email)) errors.email = 'Must not be empty';
  if (isEmpty(user.password)) errors.password = 'Must not be empty';

  if (Object.keys(errors).length > 0) return res.status(401).json(errors);

  try {
    const auth = await firebase.auth().signInWithEmailAndPassword(user.email, user.password);
    return res.json({ token: await auth.user?.getIdToken() });
  } catch (ex) {
    functions.logger.warn(`user could not log in: ${ex.message} (${ex.code})`);
    if (['auth/wrong-password', 'auth/user-not-found'].includes(ex.code)) {
      return res.status(401).json({ general: 'Wrong credentials' });
    }

    return res.status(500).json({ error: ex.code });
  }
});

export const api = functions.region('europe-west1').https.onRequest(app);

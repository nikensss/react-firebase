import * as cors from 'cors';
import * as express from 'express';
import firebase from 'firebase';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { isRegistered } from './middlewares';
import { login, signup } from './routes/auth';
import {
  commentOnScream,
  deleteScream,
  getScream,
  getScreams,
  likeScream,
  scream,
  unlikeScream
} from './routes/screams';
import {
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
  uploadImage
} from './routes/user';

firebase.initializeApp({
  apiKey: 'AIzaSyABk4Zyl_cBnjPkSp7NIzbp4wq85zg1waA',
  authDomain: 'react-firebase-4283b.firebaseapp.com',
  projectId: 'react-firebase-4283b',
  storageBucket: 'react-firebase-4283b.appspot.com',
  messagingSenderId: '1033277610291',
  appId: '1:1033277610291:web:d325edb38f8f35a8514646',
  measurementId: 'G-B4HXZCVVG4'
});

const app = express();

app.use(cors({ origin: true }));
app.use((req, res, next) => {
  const now = admin.firestore.Timestamp.now().toDate();
  functions.logger.info(`new request received (${req.method}) at ${req.originalUrl} (${now})`);
  next();
});

app.get('/', (req, res) => res.json({ message: 'api root! 🥳' }));

app.post('/scream', isRegistered, scream);
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', isRegistered, commentOnScream);
app.post('/scream/:screamId/like', isRegistered, likeScream);
app.post('/scream/:screamId/unlike', isRegistered, unlikeScream);
app.delete('/scream/:screamId', isRegistered, deleteScream);

app.get('/screams', getScreams);

app.post('/signup', signup);
app.post('/login', login);

app.get('/user', isRegistered, getAuthenticatedUser);
app.post('/user', isRegistered, addUserDetails);
app.post('/user/image', isRegistered, uploadImage);
app.get('/user/:handle', getUserDetails);

app.post('/notifications', isRegistered, markNotificationsRead);

export const api = functions.region('europe-west1').https.onRequest(app);
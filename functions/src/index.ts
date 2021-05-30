import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { app } from './api/api';

admin.initializeApp();

export const api = functions.region('europe-west1').https.onRequest(app);

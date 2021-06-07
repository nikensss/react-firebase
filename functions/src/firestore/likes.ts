import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { createNotificationFor } from './utils';

const db = admin.firestore();

export const notifyLikeOnScream = functions
  .region('europe-west1')
  .firestore.document('likes/{likeId}')
  .onCreate(createNotificationFor('like'));

export const deleteLikeNotification = functions
  .region('europe-west1')
  .firestore.document('likes/{likeId}')
  .onDelete(async (snapshot) => {
    try {
      await db.collection('notifications').doc(snapshot.id).delete();
    } catch (ex) {
      functions.logger.error('Could not delete notification');
    }
  });

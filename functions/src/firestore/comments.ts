import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { createNotificationFor } from './utils';

const db = admin.firestore();

export const notifyCommentOnScream = functions
  .region('europe-west1')
  .firestore.document('comments/{commentId}')
  .onCreate(createNotificationFor('comment'));

export const deleteCommentNotification = functions
  .region('europe-west1')
  .firestore.document('comments/{commentId}')
  .onDelete(async (snapshot) => {
    try {
      await db.collection('notifications').doc(snapshot.id).delete();
    } catch (ex) {
      functions.logger.error('Could not delete notification');
    }
  });

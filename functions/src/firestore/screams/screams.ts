import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { toJsonError } from '../../utils';

const db = admin.firestore();

const createNotificationFor = (type: string) => {
  return async (snapshot: functions.firestore.QueryDocumentSnapshot) => {
    try {
      functions.logger.info(`Creating notification of type: ${type}`);
      const data = snapshot.data();
      const screamDocument = await db.collection('screams').doc(data.screamId).get();
      const scream = screamDocument.data();
      if (!scream) return;

      const recipient = scream.userHandle;
      const sender = data.userHandle;
      if (recipient === sender) {
        functions.logger.info(
          `notification not created because sender (${sender}) is recipient (${recipient})`
        );
        return;
      }

      await db.collection('notifications').doc(snapshot.id).set({
        screamId: screamDocument.id,
        createdAt: admin.firestore.Timestamp.now(),
        read: false,
        recipient,
        sender,
        type
      });
    } catch (ex) {
      functions.logger.error('Could not create notification!', toJsonError(ex), { type });
    }
  };
};

export const notifyLikeOnScream = functions
  .region('europe-west1')
  .firestore.document('likes/{likeId}')
  .onCreate(createNotificationFor('like'));

export const deleteLikeNotificationOnUnlike = functions
  .region('europe-west1')
  .firestore.document('likes/{likeId}')
  .onDelete(async (snapshot) => {
    try {
      await db.collection('notifications').doc(snapshot.id).delete();
    } catch (ex) {
      functions.logger.error('Could not delete notification');
    }
  });

export const notifyCommentOnScream = functions
  .region('europe-west1')
  .firestore.document('comments/{commentId}')
  .onCreate(createNotificationFor('comment'));

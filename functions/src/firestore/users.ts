import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { toJsonError } from '../utils/utils';

const db = admin.firestore();

export const onUserImageUpdate = functions
  .region('europe-west1')
  .firestore.document('/users/{userId}')
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    try {
      if (before.imageUrl === after.imageUrl) return;

      await db.runTransaction(async (t) => {
        const screams = await db
          .collection('screams')
          .where('userHandle', '==', before.handle)
          .get();
        const comments = await db
          .collection('comments')
          .where('userHandle', '==', before.handle)
          .get();

        [...screams.docs, ...comments.docs].forEach((d) => {
          t.update(d.ref, { userImage: after.imageUrl });
        });
      });
    } catch (ex) {
      functions.logger.error(
        'could not update user image in screams and comments',
        toJsonError(ex),
        { before, after }
      );
    }
  });

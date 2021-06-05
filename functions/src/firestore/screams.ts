import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

export const onScreamDelete = functions
  .region('europe-west1')
  .firestore.document('screams/{screamId}')
  .onDelete(async (snapshot) => {
    const screamId = snapshot.id;
    await db.runTransaction(async (t) => {
      const likes = await db.collection('likes').where('screamId', '==', screamId).get();
      const comments = await db.collection('comments').where('screamId', '==', screamId).get();
      // notifications will be deleted by the onDelete handler set to the likes
      // and comments collections

      [...likes.docs, ...comments.docs].forEach((d) => t.delete(d.ref));
    });
  });

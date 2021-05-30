// import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// const db = admin.firestore();

export const createUserRecord = functions.auth.user().onCreate(async (user) => {
  functions.logger.info(`new user signed up: ${user.email} (${user.uid})`);
  // if (!user.email) return;

  // const handle = user.email.split('@').shift() as string;

  // return await db
  //   .collection('/users')
  //   .doc(handle)
  //   .set({
  //     displayName: user.displayName || '',
  //     email: user.email,
  //     createdAt: context.timestamp || admin.firestore.Timestamp.now(),
  //     handle
  //   });
});

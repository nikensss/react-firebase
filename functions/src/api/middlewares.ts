import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { toJsonError } from '../utils/utils';

const db = admin.firestore();

export const isRegistered = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  if (!req.headers.authorization) return res.status(403).json({ error: 'Unauthorized' }).end();

  if (!req.headers.authorization.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Unauthorized' }).end();
  }

  try {
    const idToken = req.headers.authorization.split('Bearer ').pop() as string;
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;

    const { docs } = await db
      .collection('users')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get();

    const user = docs.shift();
    if (!user) return res.status(403).json({ error: 'Unauthorized' }).end();

    req.user.handle = user.data().handle;
    req.user.imageUrl = user.data().imageUrl;

    return next(null);
  } catch (ex) {
    functions.logger.error('could not authenticate user', toJsonError(ex));

    return res.status(403).json(toJsonError(ex)).end();
  }
};

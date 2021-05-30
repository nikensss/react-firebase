import * as express from 'express';
import * as admin from 'firebase-admin';
import { isEmpty, toJsonError } from '../../utils';

const db = admin.firestore();

export const getScreams = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  try {
    const { docs } = await db.collection('screams').orderBy('createdAt', 'desc').get();
    return res.json({
      screams: docs.map((d) => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt.toDate() }))
    });
  } catch (ex) {
    return res.status(500).json(toJsonError(ex));
  }
};

export const scream = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  try {
    if (!req.user) throw new Error('Unauthenticated request!');

    if (isEmpty(req.body.body)) return res.status(401).json({ body: 'Must not be empty' });

    const scream = {
      body: req.body.body,
      handle: req.user.handle,
      createdAt: admin.firestore.Timestamp.now()
    };

    const result = await db.collection('screams').add(scream);
    return res.json({ message: `scream created (${result.id})` });
  } catch (ex) {
    return res.status(500).json(toJsonError(ex));
  }
};

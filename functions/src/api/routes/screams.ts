import * as express from 'express';
import * as admin from 'firebase-admin';
import { isEmpty, toJsonError } from '../../utils';

const db = admin.firestore();

export const getScream = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  try {
    const doc = await db.collection('screams').doc(req.params.screamId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'scream not found' });
    }

    const scream: Record<string, unknown> = Object.assign({ screamId: doc.id }, doc.data());
    const { docs: comments } = await db
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .where('screamId', '==', scream.screamId)
      .get();

    scream.comments = comments.map((c) => c.data());

    return res.json(scream);
  } catch (ex) {
    return res.status(500).json(toJsonError(ex));
  }
};

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

export const commentOnScream = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  try {
    if (!req.user) throw new Error('Unauthenticated request!');

    if (isEmpty(req.body.body)) return res.status(401).json({ body: 'Must not be empty' });

    const comment = {
      body: req.body.body,
      createdAt: admin.firestore.Timestamp.now(),
      userHandle: req.user.handle,
      userImage: req.user.imageUrl,
      screamId: req.params.screamId
    };

    const scream = await db.collection('screams').doc(req.params.screamId).get();
    if (!scream.exists) {
      return res.status(404).json({ error: 'original scream not found' });
    }

    const result = await db.collection('comments').add(comment);
    return res.json((await result.get()).data());
  } catch (ex) {
    return res.status(500).json(toJsonError(ex));
  }
};

import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
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
      userHandle: req.user.handle,
      userImage: req.user.imageUrl,
      likeCount: 0,
      commentCount: 0,
      createdAt: admin.firestore.Timestamp.now()
    };

    const result = await db.collection('screams').add(scream);
    const screamDocument = await result.get();
    return res.json({ id: result.id, ...screamDocument.data() });
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

    await scream.ref.update({ commentCount: admin.firestore.FieldValue.increment(1) });
    const result = await db.collection('comments').add(comment);
    return res.json((await result.get()).data());
  } catch (ex) {
    return res.status(500).json(toJsonError(ex));
  }
};

export const likeScream = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  try {
    if (!req.user) throw new Error('Unauthenticated request!');

    const screamDocument = await db.collection('screams').doc(req.params.screamId).get();
    if (!screamDocument.exists) {
      return res.status(404).json({ message: 'scream not found' });
    }

    const likesQuery = await db
      .collection('likes')
      .where('userHandle', '==', req.user.handle)
      .where('screamId', '==', req.params.screamId)
      .limit(1)
      .get();

    if (!likesQuery.empty) {
      return res.status(400).json({ message: 'scream already liked' });
    }

    await db.collection('likes').add({ screamId: screamDocument.id, userHandle: req.user.handle });
    await screamDocument.ref.update({
      likeCount: admin.firestore.FieldValue.increment(1)
    });

    return res.json((await screamDocument.ref.get()).data());
  } catch (ex) {
    functions.logger.error('Could not like scream', toJsonError(ex));
    return res.status(500).json(toJsonError(ex));
  }
};

export const unlikeScream = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  try {
    if (!req.user) throw new Error('Unauthenticated request!');

    const screamDocument = await db.collection('screams').doc(req.params.screamId).get();
    if (!screamDocument.exists) {
      return res.status(404).json({ message: 'scream not found' });
    }

    const likesQuery = await db
      .collection('likes')
      .where('userHandle', '==', req.user.handle)
      .where('screamId', '==', req.params.screamId)
      .limit(1)
      .get();

    if (likesQuery.empty) {
      return res.status(400).json({ message: 'scream already unliked' });
    }

    await likesQuery.docs[0].ref.delete();
    await screamDocument.ref.update({
      likeCount: admin.firestore.FieldValue.increment(-1)
    });

    return res.json((await screamDocument.ref.get()).data());
  } catch (ex) {
    functions.logger.error('Could not like scream', toJsonError(ex));
    return res.status(500).json(toJsonError(ex));
  }
};

export const deleteScream = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  try {
    if (!req.user) return res.status(401).json({ message: 'unauthorized' });

    const { screamId } = req.params;
    if (!screamId) return res.status(400).json({ message: `invalid scream id ${screamId}` });

    const screamDocument = await db.collection('screams').doc(screamId).get();
    const scream = screamDocument.data();
    if (!scream) return res.status(404).json({ message: 'scream not found' });

    if (scream.userHandle !== req.user.handle) {
      return res.status(403).json({ message: 'unauthorized' });
    }

    await db.runTransaction(async (t) => {
      const likes = await db.collection('likes').where('screamId', '==', screamId).get();
      const comments = await db.collection('comments').where('screamId', '==', screamId).get();

      likes.docs.map((like) => t.delete(like.ref));
      comments.docs.map((comment) => t.delete(comment.ref));
      t.delete(screamDocument.ref);
    });

    return res.json({ message: `comments, likes and scream ${screamDocument.id} deleted` });
  } catch (ex) {
    return res.status(500).json(toJsonError(ex));
  }
};

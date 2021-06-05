import * as BusBoy from 'busboy';
import { format } from 'date-fns';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { toJsonError } from '../../utils';
import { reduceUserDetails } from '../../utils/validators';
const db = admin.firestore();

export const getAuthenticatedUser = async (
  req: express.Request,
  res: express.Response
): Promise<unknown> => {
  if (!req.user) return res.status(403).json({ message: 'unauthorized' });
  const { handle } = req.user;

  try {
    const result: Record<string, unknown> = {};
    const user = (await db.collection('users').doc(handle).get()).data();
    if (!user) {
      return res.status(404).json({ message: 'not found' });
    }
    result.credentials = user;
    const likes = await db.collection('likes').where('userHandle', '==', handle).get();
    result.likes = likes.docs.map((l) => l.data());

    const notifications = await db
      .collection('notifications')
      .where('recipient', '==', handle)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    result.notifications = notifications.docs.map((n) => ({ notificationId: n.id, ...n.data() }));

    return res.json({ userData: result });
  } catch (ex) {
    return res.status(500).json({ error: ex.code });
  }
};

export const addUserDetails = async (
  req: express.Request,
  res: express.Response
): Promise<unknown> => {
  if (!req.user) return res.status(403).json({ message: 'unauthorized' });
  const { handle } = req.user;

  const userDetails = reduceUserDetails(req.body);

  try {
    await db.collection('users').doc(handle).update(userDetails);
    return res.json({ message: 'details added successfully' });
  } catch (ex) {
    return res.status(500).json({ error: ex.code });
  }
};

export const uploadImage = async (
  req: express.Request,
  res: express.Response
): Promise<unknown> => {
  if (!req.user) return res.status(403).json({ message: 'unauthorized' });
  const { handle } = req.user;

  const busboy = new BusBoy({ headers: req.headers });

  const image = {
    filePath: '',
    mimetype: ''
  };

  busboy.on(
    'file',
    (
      fieldName: string,
      file: NodeJS.ReadableStream,
      filename: string,
      encoding: string,
      mimetype: string
    ) => {
      if (!['image/jpeg', 'image/png'].includes(mimetype)) {
        return res.status(401).json({ message: 'Wrong file type' }).end();
      }
      const imageExtension = path.extname(filename);
      const imageFileName = `${format(new Date(), 'yyyy-MM-dd_HHmmss')}${imageExtension}`;
      image.filePath = path.join(os.tmpdir(), imageFileName);
      image.mimetype = mimetype;

      file.pipe(fs.createWriteStream(image.filePath));
    }
  );

  busboy.on('finish', async () => {
    try {
      const [upload] = await admin
        .storage()
        .bucket()
        .upload(image.filePath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: image.mimetype
            }
          }
        });
      functions.logger.debug('image uploaded', { imageUrl: upload.publicUrl() });

      await db
        .collection('users')
        .doc(handle)
        .set({ imageUrl: upload.publicUrl() }, { merge: true });

      functions.logger.info('image uploaded successfully');
      res.json({ message: 'image uploaded successfully' });
    } catch (ex) {
      functions.logger.error('could not upload image!', toJsonError(ex));
      res.status(500).json({ error: ex.code });
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  busboy.end(req.rawBody);

  return;
};

export const getUserDetails = async (
  req: express.Request,
  res: express.Response
): Promise<unknown> => {
  try {
    const { handle } = req.params;
    if (!handle) {
      return res.status(401).json({ message: `invalid handle: ${handle}` });
    }

    const result: Record<string, unknown> = {};
    const user = (await db.collection('users').doc(handle).get()).data();
    if (!user) {
      return res.status(404).json({ message: 'not found' });
    }
    result.user = user;

    const screams = await db
      .collection('screams')
      .where('userHandle', '==', handle)
      .orderBy('createdAt', 'desc')
      .get();
    result.screams = screams.docs.map((s) => ({ screamId: s.id, ...s.data() }));

    const comments = await db
      .collection('comments')
      .where('userHandle', '==', handle)
      .orderBy('createdAt', 'desc')
      .get();
    result.comments = comments.docs.map((c) => c.data());

    const likes = await db.collection('likes').where('userHandle', '==', handle).get();
    result.likes = likes.docs.map((l) => l.data());

    return res.json({ userData: result });
  } catch (ex) {
    return res.status(500).json({ error: ex.code });
  }
};

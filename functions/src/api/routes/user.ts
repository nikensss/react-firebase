import * as BusBoy from 'busboy';
import { format } from 'date-fns';
import * as express from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { toJsonError } from '../../utils';
const db = admin.firestore();

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
        return res.status(401).json({ message: 'Wrong image type' }).end();
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

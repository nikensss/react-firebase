import * as express from 'express';
import firebase from 'firebase';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { toJsonError } from '../../utils';
import { UserSignup, validateLoginData, validateSignupData } from '../../utils/validators';

const db = admin.firestore();

export const signup = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  const user = req.body as UserSignup;

  const { valid, errors } = validateSignupData(user);

  if (!valid) return res.status(401).json(errors);

  try {
    const userDoc = await db.collection('users').doc(user.handle).get();
    if (userDoc.exists) {
      return res.status(401).json({ handle: `handle ${user.handle} already in use` });
    }

    const data = await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
    if (!data.user) throw new Error('Could not sign up user!');

    await userDoc.ref.set({
      email: user.email,
      handle: user.handle,
      userId: data.user.uid,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/react-firebase-4283b.appspot.com/o/blank_profile_picture.png?alt=media',
      createdAt: admin.firestore.Timestamp.now()
    });

    functions.logger.info(`new user registered: ${data.user.email} (${data.user.uid})`);
    return res.status(201).json({
      message: `user ${data.user.email} signed up successfully!`,
      token: await data.user.getIdToken()
    });
  } catch (ex) {
    const error = toJsonError(ex);
    functions.logger.error(`could not register user ${user.email}`, {
      ...req.body,
      ...error
    });

    if (error.error.message.includes('email address is already in use')) {
      return res.status(401).json({ email: error });
    }

    return res.status(500).json(error);
  }
};

export const login = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response<unknown>> => {
  const user = req.body;

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(401).json(errors);

  try {
    const auth = await firebase.auth().signInWithEmailAndPassword(user.email, user.password);
    return res.json({ token: await auth.user?.getIdToken() });
  } catch (ex) {
    functions.logger.warn(`user could not log in: ${ex.message} (${ex.code})`);
    if (['auth/wrong-password', 'auth/user-not-found'].includes(ex.code)) {
      return res.status(401).json({ general: 'Wrong credentials' });
    }

    return res.status(500).json({ error: ex.code });
  }
};

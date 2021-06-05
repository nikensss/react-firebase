import { isEmail, isEmpty } from './utils';

export interface Validator {
  errors: Record<string, string>;
  valid: boolean;
}

export interface UserSignup {
  email: string;
  password: string;
  confirmPassword: string;
  handle: string;
}

export const validateSignupData = (user: UserSignup): Validator => {
  const errors: Record<string, string> = {};
  if (isEmpty(user.email)) {
    errors.email = 'Must not be empty';
  } else if (!isEmail(user.email)) {
    errors.email = 'Invalid email address';
  }

  if (isEmpty(user.password)) errors.password = 'Must not be empty';
  if (user.password !== user.confirmPassword) errors.confirmPassword = 'Password must match';
  if (isEmpty(user.handle)) errors.handle = 'Must not be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

export interface UserLogin {
  email: string;
  password: string;
}

export const validateLoginData = (user: UserLogin): Validator => {
  const errors: Record<string, string> = {};
  if (isEmpty(user.email)) errors.email = 'Must not be empty';
  if (isEmpty(user.password)) errors.password = 'Must not be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
};

export const reduceUserDetails = (data: Record<string, string>): Record<string, string> => {
  const userDetails: Record<string, string> = {};

  if (data.bio && !isEmpty(data.bio.trim())) userDetails.bio = data.bio.trim();
  // if strictly http, ignore the website
  if (data.website && !isEmpty(data.website.trim())) {
    if (!data.website.startsWith('http:')) {
      userDetails.website = '';
    } else if (!data.website.startsWith('https:')) {
      userDetails.website = `https://${data.website.trim()}`;
    } else {
      userDetails.website = data.website.trim();
    }
  }
  if (data.location && !isEmpty(data.location.trim())) userDetails.location = data.location.trim();

  return userDetails;
};

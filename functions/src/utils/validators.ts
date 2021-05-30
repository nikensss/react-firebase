import { isEmail, isEmpty } from '.';

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

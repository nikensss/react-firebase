export interface JsonError {
  error: {
    name: string;
    message: string;
    stack: string | undefined;
  };
}

export const toJsonError = (ex: Error): JsonError => {
  return { error: { name: ex.name, message: ex.message, stack: ex.stack } };
};

export const isEmpty = (s: string): boolean => s.trim().length === 0;

export const isEmail = (email: string): boolean => {
  const emailRegEx =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(emailRegEx) !== null;
};

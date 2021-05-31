declare namespace Express {
  export interface Request {
    user?: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawBody: any;
  }
}

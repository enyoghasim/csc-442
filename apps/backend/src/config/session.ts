import session, { SessionOptions } from 'express-session';
import RedisStore from 'connect-redis';
import type { RequestHandler } from 'express';
import { redis } from './redis';
import { env } from './env';

// Opaque, Redis-backed session IDs only — no JWT. The cookie carries nothing but the session id;
// connect-redis stores/reads the actual SessionData (see src/@types/express-session/index.d.ts) in Redis.
export const sessionOptions: SessionOptions = {
  store: new RedisStore({ client: redis, prefix: 'sess:' }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: env.SESSION_TTL_SECONDS * 1000,
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
};

export const sessionMiddleware: RequestHandler = session(sessionOptions);

import { env } from './env';

// Auth sessions (opaque session id -> SessionData), owned by connect-redis via config/session.ts's `prefix` option.
export const SESSION_TTL_SECONDS = env.SESSION_TTL_SECONDS;

// Rotating QR check-in tokens, one active token per class session.
export const QR_TOKEN_TTL_SECONDS = 90;
export const qrTokenKey = (classSessionId: string): string =>
  `qr:${classSessionId}`;

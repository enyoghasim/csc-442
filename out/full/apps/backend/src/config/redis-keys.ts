import { env } from './env';

// Auth sessions (opaque session id -> SessionData), owned by connect-redis via config/session.ts's `prefix` option.
export const SESSION_TTL_SECONDS = env.SESSION_TTL_SECONDS;

// Rotating QR check-in tokens, one active token per class session — authenticator-style timing:
// the dashboard re-issues (rotates) a token every 15s (see qr-display.tsx's refetchInterval), and
// this TTL is that interval plus a buffer, not a match to it — a token scanned right as it's
// about to be superseded still has a few seconds of network/processing slack to reach the
// check-in endpoint before it's rejected as expired.
export const QR_TOKEN_TTL_SECONDS = 39;
export const qrTokenKey = (classSessionId: string): string =>
  `qr:${classSessionId}`;

export {};

declare global {
  namespace Express {
    interface Request {
      // Set by SessionAuthGuard from `request.session.userId` once authenticated. Deliberately
      // a separate property rather than reading `request.session` everywhere downstream.
      currentUserId?: string;
    }
  }
}

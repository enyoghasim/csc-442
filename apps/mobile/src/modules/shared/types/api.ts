// Matches apps/backend's response-factory.ts (success) and http-exception.filter.ts (error) —
// NOT the reference project's shape (that one has `errors: ApiFieldError[]`, ours doesn't).
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export function successResponse<T>(
  data: T,
  message?: string,
): SuccessResponse<T> {
  return { success: true, data, message };
}

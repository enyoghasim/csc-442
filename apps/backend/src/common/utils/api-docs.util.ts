// Swagger `schema.example` builder matching HttpExceptionFilter's error envelope
// ({ success: false, error: { statusCode, message } }) — shared across controllers so every
// documented error response stays in sync with the actual global error shape.
export function errorExample(statusCode: number, message: string) {
  return { success: false, error: { statusCode, message } };
}

/**
 * Creates an error for the global error handler.
 * @param {string} code Stable code the frontend uses for translation
 */
export function httpError(message, code, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

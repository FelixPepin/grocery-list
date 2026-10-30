/**
 * Creates an HTTP error for the global error handler.
 *
 * @param {string} message Error message
 * @param {string} code Stable code the frontend can use for translation
 * @param {number} statusCode HTTP status (400, 404, 422...)
 * @returns {Error} The error to pass to next() or to throw
 */
export function httpError(message, code, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

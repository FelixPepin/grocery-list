/**
 * Dictionary of standard HTTP errors
 */
const errorTypes = {
  400: "Bad Request",
  404: "Not Found",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

/**
 * Middleware that captures undefined routes.
 * @param {*} req
 * @param {*} res
 */
export const get404 = (req, res) => {
  res.status(404).json({
    status: 404,
    error: errorTypes[404],
    message: "Resource not found",
    code: "ROUTE_NOT_FOUND",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Global error handler: turns any error into a consistent JSON response.
 *
 * Express 5 forwards errors thrown in async handlers to this middleware automatically,
 * so controllers don't need try/catch blocks that only call next(err).
 */
export const getErrors = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An error occurred";
  let code = err.code;

  // Malformed JSON in the request body (thrown by express.json())
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON body";
    code = "INVALID_JSON";
  }

  // Database CHECK constraint: last line of defense after the API validation
  if (err.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
    statusCode = 422;
    message = "The data does not respect the database constraints";
    code = "CONSTRAINT_VIOLATION";
  }

  // Unexpected error: log the details, but never expose them to the client
  if (statusCode === 500) {
    console.error(err);
    message = "An internal error occurred";
    code = "INTERNAL_ERROR";
  }

  res.status(statusCode).json({
    status: statusCode,
    error: errorTypes[statusCode] || "Error",
    message,
    ...(code && { code }),
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

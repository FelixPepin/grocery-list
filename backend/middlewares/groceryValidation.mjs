const NAME_MAX_LENGTH = 50;

/**
 * Creates a validation error for the global error handler.
 * 
 * @param {string} message Error message
 * @param {string} code Stable code the frontend can use for translation.
 * @param {number} statusCode 400 when a field is missing, 422 when a field is invalid
 * @returns {Error} The error to pass to next()
 */
function validationError(message, code, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function validateGroceryItem(req, res, next) {
  const { name, quantity, unit_price } = req.body;

  // Name validation
  if (name === undefined || name === null) {
    return next(validationError("Name is required", "NAME_REQUIRED", 400));
  }
  if (typeof name !== "string") {
    return next(validationError("Name must be a string", "NAME_INVALID", 422));
  }
  if (name.trim() === "") {
    return next(validationError("Name cannot be empty", "NAME_EMPTY", 422));
  }
  if (name.trim().length > NAME_MAX_LENGTH) {
    return next(
      validationError(
        `Name cannot exceed ${NAME_MAX_LENGTH} characters`,
        "NAME_TOO_LONG",
        422,
      ),
    );
  }

  // Quantity validation
  if (quantity === undefined || quantity === null) {
    return next(
      validationError("Quantity is required", "QUANTITY_REQUIRED", 400),
    );
  }
  if (!Number.isInteger(quantity)) {
    return next(
      validationError("Quantity must be an integer", "QUANTITY_INVALID", 422),
    );
  }
  if (quantity < 1) {
    return next(
      validationError("Quantity must be at least 1", "QUANTITY_TOO_LOW", 422),
    );
  }

  // Unit price validation
  if (unit_price === undefined || unit_price === null) {
    return next(
      validationError("Unit price is required", "UNIT_PRICE_REQUIRED", 400),
    );
  }
  if (typeof unit_price !== "number" || !Number.isFinite(unit_price)) {
    return next(
      validationError("Unit price must be a number", "UNIT_PRICE_INVALID", 422),
    );
  }
  if (unit_price <= 0) {
    return next(
      validationError(
        "Unit price must be greater than 0",
        "UNIT_PRICE_TOO_LOW",
        422,
      ),
    );
  }

  req.body.name = name.trim();

  next();
}

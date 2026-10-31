import { httpError } from "../utils/httpError.mjs";

const NAME_MAX_LENGTH = 50;
const QUANTITY_MAX = 10000;
const UNIT_PRICE_MAX = 100000;

/**
 * Validates the body of POST and PUT /grocery_list requests.
 * On success, the name is trimmed before reaching the controller.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function validateGroceryItem(req, res, next) {
  const { name, quantity, unit_price } = req.body;

  // Name validation
  if (name === undefined || name === null) {
    return next(httpError("Name is required", "NAME_REQUIRED", 400));
  }
  if (typeof name !== "string") {
    return next(httpError("Name must be a string", "NAME_INVALID", 422));
  }
  if (name.trim() === "") {
    return next(httpError("Name cannot be empty", "NAME_EMPTY", 422));
  }
  if (name.trim().length > NAME_MAX_LENGTH) {
    return next(
      httpError(
        `Name cannot exceed ${NAME_MAX_LENGTH} characters`,
        "NAME_TOO_LONG",
        422,
      ),
    );
  }

  // Quantity validation
  if (quantity === undefined || quantity === null) {
    return next(httpError("Quantity is required", "QUANTITY_REQUIRED", 400));
  }
  if (!Number.isInteger(quantity)) {
    return next(
      httpError("Quantity must be an integer", "QUANTITY_INVALID", 422),
    );
  }
  if (quantity < 1) {
    return next(
      httpError("Quantity must be at least 1", "QUANTITY_TOO_LOW", 422),
    );
  }
  if (quantity > QUANTITY_MAX) {
    return next(
      httpError(
        `Quantity cannot exceed ${QUANTITY_MAX}`,
        "QUANTITY_TOO_HIGH",
        422,
      ),
    );
  }

  // Unit price validation
  if (unit_price === undefined || unit_price === null) {
    return next(
      httpError("Unit price is required", "UNIT_PRICE_REQUIRED", 400),
    );
  }
  if (typeof unit_price !== "number" || !Number.isFinite(unit_price)) {
    return next(
      httpError("Unit price must be a number", "UNIT_PRICE_INVALID", 422),
    );
  }
  if (unit_price <= 0) {
    return next(
      httpError("Unit price must be greater than 0", "UNIT_PRICE_TOO_LOW", 422),
    );
  }
  if (unit_price > UNIT_PRICE_MAX) {
    return next(
      httpError(
        `Unit price cannot exceed ${UNIT_PRICE_MAX}`,
        "UNIT_PRICE_TOO_HIGH",
        422,
      ),
    );
  }

  req.body.name = name.trim();

  next();
}

/**
 * Validates the :id parameter of PUT and DELETE /grocery_list/:id requests.
 * URL parameters are always strings, so the id is converted before being checked.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export function validateItemId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return next(httpError("Id must be a number over 0", "ID_INVALID", 400));
  }
  next();
}

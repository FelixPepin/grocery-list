import { describe, it, expect, vi } from "vitest";
import {
  validateGroceryItem,
  validateItemId,
} from "../middlewares/groceryValidation.mjs";

const validItem = { name: "Apple", quantity: 3, unit_price: 1.5 };

/**
 * Calls a middleware with a fake request and returns what was passed to next():
 * undefined when the data is valid, an Error otherwise.
 * No Express server is needed: the middleware is tested on its own (unit test).
 */
function runMiddleware(middleware, req) {
  const next = vi.fn();
  middleware(req, {}, next);
  // Calling next() twice would make Express send two responses
  expect(next).toHaveBeenCalledOnce();
  return next.mock.calls[0][0];
}

describe("validateGroceryItem", () => {
  it("calls next() without an error for a valid item", () => {
    const req = { body: { ...validItem } };

    expect(runMiddleware(validateGroceryItem, req)).toBeUndefined();
  });

  it("trims the name before it reaches the controller", () => {
    const req = { body: { ...validItem, name: "  Apple  " } };

    runMiddleware(validateGroceryItem, req);

    expect(req.body.name).toBe("Apple");
  });

  // Each row breaks only ONE field of a valid item, so we know which rule failed
  it.each([
    ["name is missing", { name: undefined }, 400, "NAME_REQUIRED"],
    ["name is null", { name: null }, 400, "NAME_REQUIRED"],
    ["name is not a string", { name: 123 }, 422, "NAME_INVALID"],
    ["name is only spaces", { name: "   " }, 422, "NAME_EMPTY"],
    ["name is too long", { name: "A".repeat(51) }, 422, "NAME_TOO_LONG"],
    ["quantity is missing", { quantity: undefined }, 400, "QUANTITY_REQUIRED"],
    ["quantity is a decimal", { quantity: 2.5 }, 422, "QUANTITY_INVALID"],
    ["quantity is a string", { quantity: "3" }, 422, "QUANTITY_INVALID"],
    ["quantity is 0", { quantity: 0 }, 422, "QUANTITY_TOO_LOW"],
    ["quantity is negative", { quantity: -1 }, 422, "QUANTITY_TOO_LOW"],
    ["unit_price is missing", { unit_price: undefined }, 400, "UNIT_PRICE_REQUIRED"],
    ["unit_price is a string", { unit_price: "1.5" }, 422, "UNIT_PRICE_INVALID"],
    ["unit_price is NaN", { unit_price: NaN }, 422, "UNIT_PRICE_INVALID"],
    ["unit_price is 0", { unit_price: 0 }, 422, "UNIT_PRICE_TOO_LOW"],
    ["unit_price is negative", { unit_price: -2 }, 422, "UNIT_PRICE_TOO_LOW"],
    ["quantity is too high", { quantity: 10001 }, 422, "QUANTITY_TOO_HIGH"],
    ["unit_price is too high", { unit_price: 100001 }, 422, "UNIT_PRICE_TOO_HIGH"],
  ])("rejects the item when %s (%i %s)", (_label, override, status, code) => {
    // Arrange
    const req = { body: { ...validItem, ...override } };

    // Act
    const error = runMiddleware(validateGroceryItem, req);

    // Assert
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(status);
    expect(error.code).toBe(code);
  });
});

describe("validateItemId", () => {
  // URL parameters always arrive as strings
  it.each(["1", "42"])("accepts the id %s", (id) => {
    expect(runMiddleware(validateItemId, { params: { id } })).toBeUndefined();
  });

  // "" is an edge case: Number("") is 0, which must be rejected
  it.each(["abc", "0", "-3", "2.5", ""])(
    "rejects the id '%s' with 400 ID_INVALID",
    (id) => {
      const error = runMiddleware(validateItemId, { params: { id } });

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("ID_INVALID");
    },
  );
});
export const NAME_MAX_LENGTH = 50;
export const QUANTITY_MAX = 10000;
export const UNIT_PRICE_MAX = 100000;

/** True when an input is left blank (v-model.number keeps '' for an empty field). */
const isEmpty = (value) => value === '' || value === null || value === undefined;

/**
 * Validates a grocery item with the same rules as the API.
 * Returns one error code per invalid field (the codes match the API's, so they share the
 * same translations), or an empty object when the item is valid.
 *
 * @param {{ name: string, quantity: number|string, unit_price: number|string }} item
 * @returns {{ name?: string, quantity?: string, unit_price?: string }}
 */
export function validateItem({ name, quantity, unit_price }) {
  const errors = {}

  if (typeof name !== 'string' || name.trim() === '') {
    errors.name = 'NAME_EMPTY';
  } else if (name.trim().length > NAME_MAX_LENGTH) {
    errors.name = 'NAME_TOO_LONG';
  }

  if (isEmpty(quantity)) {
    errors.quantity = 'QUANTITY_REQUIRED';
  } else if (!Number.isInteger(quantity)) {
    errors.quantity = 'QUANTITY_INVALID';
  } else if (quantity < 1) {
    errors.quantity = 'QUANTITY_TOO_LOW';
  }
  else if (quantity > QUANTITY_MAX) {
    errors.quantity = 'QUANTITY_TOO_HIGH'
  }

  if (isEmpty(unit_price)) {
    errors.unit_price = 'UNIT_PRICE_REQUIRED'
  } else if (typeof unit_price !== 'number' || !Number.isFinite(unit_price)) {
    errors.unit_price = 'UNIT_PRICE_INVALID'
  } else if (unit_price <= 0) {
    errors.unit_price = 'UNIT_PRICE_TOO_LOW'
  }
  else if (unit_price > UNIT_PRICE_MAX) {
    errors.unit_price = 'UNIT_PRICE_TOO_HIGH'
  }

  return errors
}
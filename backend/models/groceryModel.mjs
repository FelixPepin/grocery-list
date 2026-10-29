import pool from "../db.mjs";

/**
 * Get all grocery items in the database
 * @returns {Promise<Array>} Array of all grocery items
 */
export const getAllItems = async () => {
  const [rows] = await pool.execute(
    `SELECT id, name, quantity, unit_price FROM grocery_items ORDER BY id DESC`,
  );

  return rows;
};

/**
 * Get a grocery item by its id
 * @param {number} itemId
 * @returns {Promise<Object|undefined>} Returns the grocery item found or undefined if nothing is found.
 */
export const getItemById = async (itemId) => {
  const [rows] = await pool.execute(
    `SELECT id, name, quantity, unit_price FROM grocery_items WHERE id = ?`,
    [itemId],
  );
  return rows[0];
};

/**
 * Add a new grocery item to the database
 * @param {Object} groceryItem The grocery item to add to the database
 * @returns The id of the newly created grocery item
 */
export const createItem = async (groceryItem) => {
  const { name, quantity, unit_price } = groceryItem;

  const [result] = await pool.execute(
    `INSERT INTO grocery_items (name, quantity, unit_price) VALUES (?, ?, ?)`,
    [name, quantity, unit_price],
  );
  return result.insertId;
};

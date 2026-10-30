import express from "express";

import {
  validateGroceryItem,
  validateItemId,
} from "../middlewares/groceryValidation.mjs";
import {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  deleteAllItems,
} from "../controllers/groceryController.mjs";

const router = express.Router();

// Returns every item of the grocery list.
router.get("/", getItems);

// Creates an item.
router.post("/", validateGroceryItem, createItem);

// Modify an item.
router.put("/:id", validateItemId, validateGroceryItem, updateItem);

// Delete an item.
router.delete("/:id", validateItemId, deleteItem);

// Delete all items.
router.delete("/", deleteAllItems);

export default router;

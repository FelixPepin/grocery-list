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

router.get("/", getItems);
router.post("/", validateGroceryItem, createItem);
router.put("/:id", validateItemId, validateGroceryItem, updateItem);
router.delete("/:id", validateItemId, deleteItem);
router.delete("/", deleteAllItems);

export default router;

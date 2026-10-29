import express from "express";


import {validateGroceryItem} from "../middlewares/groceryValidation.mjs"
import { createItem, getItems } from '../controllers/groceryController.mjs';

const router = express.Router();

// Returns every item of the grocery list.
router.get("/", getItems)

// Creates an item.
router.post("/", validateGroceryItem , createItem)

// Modify an item.
router.put("/:id", validateGroceryItem,)

export default router
import {
  getAllItems,
  getItemById,
  createItem as createItemModel,
  updateItem as updateItemModel,
  deleteItem as deleteItemModel,
  deleteAllItems as deleteAllItemsModel,
} from "../models/groceryModel.mjs";
import { httpError } from "../utils/httpError.mjs";

/**
 * GET /grocery_list : Returns every item of the grocery list.
 * @param {*} req
 * @param {*} res
 */
export const getItems = async (req, res) => {
  const items = await getAllItems();

  res.status(200).json({
    status: 200,
    message: "Items retrieved successfully",
    data: items,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * POST /grocery_list : Creates an item.
 * @param {*} req
 * @param {*} res
 */
export const createItem = async (req, res) => {
  const { name, quantity, unit_price } = req.body;

  const itemId = await createItemModel({
    name,
    quantity,
    unit_price,
  });

  const item = await getItemById(itemId);

  res.status(201).location(`/grocery_list/${itemId}`).json({
    status: 201,
    message: "Item created successfully",
    data: item,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * PUT /grocery_list/:id : Updates an item.
 * @param {*} req
 * @param {*} res
 */
export const updateItem = async (req, res) => {
  const { name, quantity, unit_price } = req.body;
  const itemId = Number(req.params.id);

  const item = await getItemById(itemId);

  if (!item) {
    throw httpError(`Item ${itemId} not found`, "ITEM_NOT_FOUND", 404);
  }

  await updateItemModel(itemId, { name, quantity, unit_price });

  const updatedItem = await getItemById(itemId);

  res.status(200).json({
    status: 200,
    message: "Item updated successfully",
    data: updatedItem,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * DELETE /grocery_list/:id : Deletes an item.
 * @param {*} req
 * @param {*} res
 */
export const deleteItem = async (req, res) => {
  const itemId = Number(req.params.id);

  const item = await getItemById(itemId);
  if (!item) {
    throw httpError(`Item ${itemId} not found`, "ITEM_NOT_FOUND", 404);
  }

  await deleteItemModel(itemId);

  res.status(204).send();
};

/**
 * DELETE /grocery_list : Deletes all items.
 * @param {*} req
 * @param {*} res
 */
export const deleteAllItems = async (req, res) => {
  await deleteAllItemsModel();

  res.status(204).send();
};

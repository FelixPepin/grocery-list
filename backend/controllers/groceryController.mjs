import {
  getAllItems,
  getItemById,
  createItem as createItemModel,
} from "../models/groceryModel.mjs";

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

import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

// The model is mocked: these tests never touch the database, so they also run in CI.
// vi.mock is created before the imports, so app.mjs receives this fake model.
vi.mock("../models/groceryModel.mjs", () => ({
  getAllItems: vi.fn(),
  getItemById: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  deleteAllItems: vi.fn(),
}));

import app from "../app.mjs";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  deleteAllItems,
} from "../models/groceryModel.mjs";

const apple = { id: 1, name: "Apple", quantity: 3, unit_price: 1.5 };

// Resets the mocks so a test never depends on the previous one
beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /grocery_list", () => {
  it("returns every item", async () => {
    getAllItems.mockResolvedValue([apple]);

    const response = await request(app).get("/grocery_list");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([apple]);
    expect(getAllItems).toHaveBeenCalledOnce();
  });
});

describe("POST /grocery_list", () => {
  it("creates an item with a trimmed name and returns it", async () => {
    createItem.mockResolvedValue(1);
    getItemById.mockResolvedValue(apple);

    const response = await request(app)
      .post("/grocery_list")
      .send({ name: "  Apple  ", quantity: 3, unit_price: 1.5 });

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe("/grocery_list/1");
    expect(response.body.data).toEqual(apple);
    // The validation middleware trimmed the name before the controller saved it
    expect(createItem).toHaveBeenCalledWith({ name: "Apple", quantity: 3, unit_price: 1.5 });
  });

  it("returns 422 and saves nothing when the item is invalid", async () => {
    const response = await request(app)
      .post("/grocery_list")
      .send({ name: "Apple", quantity: 0, unit_price: 1.5 });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("QUANTITY_TOO_LOW");
    expect(createItem).not.toHaveBeenCalled();
  });
});

describe("PUT /grocery_list/:id", () => {
  const changes = { name: "Green apple", quantity: 5, unit_price: 2 };

  it("updates the item and returns the saved version", async () => {
    // The controller calls getItemById twice: one answer per call, in order
    getItemById
      .mockResolvedValueOnce(apple) // existence check
      .mockResolvedValueOnce({ id: 1, ...changes }); // read after the update
    updateItem.mockResolvedValue(1);

    const response = await request(app).put("/grocery_list/1").send(changes);

    expect(response.status).toBe(200);
    expect(updateItem).toHaveBeenCalledWith(1, changes);
    expect(response.body.data).toEqual({ id: 1, ...changes });
  });

  it("returns 404 when the item does not exist", async () => {
    getItemById.mockResolvedValue(undefined);

    const response = await request(app).put("/grocery_list/99").send(changes);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ITEM_NOT_FOUND");
    expect(updateItem).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid id without querying the database", async () => {
    const response = await request(app).put("/grocery_list/abc").send(changes);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("ID_INVALID");
    expect(getItemById).not.toHaveBeenCalled();
  });
});

describe("DELETE /grocery_list/:id", () => {
  it("deletes the item and returns 204 with no body", async () => {
    getItemById.mockResolvedValue(apple);
    deleteItem.mockResolvedValue(1);

    const response = await request(app).delete("/grocery_list/1");

    expect(response.status).toBe(204);
    expect(response.text).toBe("");
    expect(deleteItem).toHaveBeenCalledWith(1);
  });

  it("returns 404 when the item does not exist", async () => {
    getItemById.mockResolvedValue(undefined);

    const response = await request(app).delete("/grocery_list/99");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ITEM_NOT_FOUND");
    expect(deleteItem).not.toHaveBeenCalled();
  });
});

describe("DELETE /grocery_list", () => {
  it("deletes every item and returns 204", async () => {
    deleteAllItems.mockResolvedValue(4);

    const response = await request(app).delete("/grocery_list");

    expect(response.status).toBe(204);
    expect(deleteAllItems).toHaveBeenCalledOnce();
  });
});

describe("Error handling", () => {
  it("returns 404 for an unknown route", async () => {
    const response = await request(app).get("/unknown");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROUTE_NOT_FOUND");
  });

  it("returns 400 for a malformed JSON body", async () => {
    // .send() with a string sends it as is, so the JSON stays broken
    const response = await request(app)
      .post("/grocery_list")
      .set("Content-Type", "application/json")
      .send('{ "name": "Egg",');

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_JSON");
  });

  it("returns 500 without leaking internal details when the database fails", async () => {
    // Hides the console.error of getErrors to keep the test output clean
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getAllItems.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:3307"));

    const response = await request(app).get("/grocery_list");

    expect(response.status).toBe(500);
    expect(response.body.code).toBe("INTERNAL_ERROR");
    // The database address must never reach the client
    expect(JSON.stringify(response.body)).not.toContain("ECONNREFUSED");

    consoleSpy.mockRestore();
  });

  it("turns a database CHECK constraint error into a 422", async () => {
    // Simulates the error MySQL throws when a CHECK constraint is violated
    const dbError = Object.assign(new Error("Check constraint violated"), {
      code: "ER_CHECK_CONSTRAINT_VIOLATED",
    });
    createItem.mockRejectedValue(dbError);

    const response = await request(app)
      .post("/grocery_list")
      .send({ name: "Apple", quantity: 3, unit_price: 1.5 });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("CONSTRAINT_VIOLATION");
  });
});

describe("CORS", () => {
  it("answers the browser preflight request with the allowed origin", async () => {
    const response = await request(app).options("/grocery_list");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });
});
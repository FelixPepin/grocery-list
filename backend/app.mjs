import express from "express";
import pool from "./db.mjs";
import { get404, getErrors } from "./controllers/errorController.mjs";

const app = express();

// Parse JSON request bodies
app.use(express.json());

// CORS: only the frontend is allowed to call the API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request sent by the browser before PUT/DELETE or JSON POST
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Log every request in the terminal
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes (step 3)

// Must stay last: unknown routes, then global error handler
app.use(get404);
app.use(getErrors);

const PORT = process.env.PORT || 3000;

// Vitest sets NODE_ENV to "test": supertest uses the exported app without a real server
if (process.env.NODE_ENV !== "test") {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL connected");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL. Is the Docker container running?", error.message);
    process.exit(1);
  }
}

export default app;
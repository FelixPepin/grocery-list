import "dotenv/config";
import mysql from "mysql2/promise";

/**
 * MySQL connection pool shared by all models.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Return DECIMAL columns (unit_price) as numbers instead of strings
  decimalNumbers: true,
});

export default pool;
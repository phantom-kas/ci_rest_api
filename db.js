// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true
  }
};

// Export an object with .query()
const db = {
  async query(sql, params) {
    let conn;
    try {
      conn = await mysql.createConnection(dbConfig);
      const [rows] = await conn.execute(sql, params);
      return rows;
    } catch (err) {
      console.error("❌ DB query error:", err);
      throw err;
    } finally {
      if (conn) await conn.end(); // close immediately to avoid MaxScale killing idle conns
    }
  }
};

export default db;

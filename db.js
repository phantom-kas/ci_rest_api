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

const db = {
  async query(sql, params = []) {
    let attempts = 0;
    while (attempts < 3) { // retry up to 3 times
      let conn;
      try {
        conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute(sql, params);
        return rows;
      } catch (err) {
        if (
          err.errno === 1927 || // Connection killed by MaxScale
          err.code === 'PROTOCOL_CONNECTION_LOST'
        ) {
          attempts++;
          console.warn(`⚠️ Lost DB connection. Retrying ${attempts}/3 ...`);
          await new Promise(res => setTimeout(res, 500 * attempts)); // backoff
          continue;
        }
        console.error("❌ DB query error:", err);
        throw err; // not retryable
      } finally {
        if (conn) await conn.end();
      }
    }
    throw new Error("DB query failed after 3 retries");
  }
};

export default db;

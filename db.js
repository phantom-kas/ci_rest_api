import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";   // <-- missing import

dotenv.config();

let db;
try {
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4181,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      ca: fs.readFileSync("./DigiCertGlobalRootG2.crt.pem", "utf8"), // use correct path
      rejectUnauthorized: true,
    },
  });
} catch (err) {
  console.log("MySQL connection fail: " + err.message);
  process.exit(1);
}

export default db;

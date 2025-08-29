import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let db
try {
    db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: {
            rejectUnauthorized: true // Enforces SSL with cert validation
        },
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
    });

     const rawQuery = db.query.bind(db);
  db.query = async (sql, params, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await rawQuery(sql, params);
      } catch (err) {
        if (err.errno === 1927 && attempt < retries) {
          console.warn("⚠️ MaxScale killed connection. Retrying...");
          continue;
        }
        throw err;
      }
    }
  };

} catch (err) {
    console.log("MySQL connection fail:" + err.message);
    process.exit();
}




export default db


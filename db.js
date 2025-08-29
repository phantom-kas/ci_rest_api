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
                const retryable =
                    (err.errno === 1927) || // MaxScale killed connection
                    (err.code === 'PROTOCOL_CONNECTION_LOST'); // dropped connection

                if (retryable && attempt < retries) {
                    console.warn(`⚠️ Lost DB connection (${err.code || err.errno}). Retrying...`);
                    continue;
                }
                throw err;
            }
        }
    };

    // ✅ Optional heartbeat every 60s to keep connection alive
    setInterval(async () => {
        try {
            await rawQuery('SELECT 1');
        } catch (e) {
            console.warn("⚠️ Heartbeat failed:", e.message);
        }
    }, 60000);
    ;

} catch (err) {
    console.log("MySQL connection fail:" + err.message);
    process.exit();
}




export default db


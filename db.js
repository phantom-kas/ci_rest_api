import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let  db
try {
    db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });
} catch (err) {
    console.log("MySQL connection fail:"+err.message);
    process.exit();
}

 export default db
 

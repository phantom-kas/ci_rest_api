import db from "../db.js"
import { getDateTime, standardResponse } from "../utils/utils.js";
import bcrypt from 'bcrypt'
export const getAllUsersService = async () => {
    const [rows] = await db.query("SELECT * from users");
    return rows;
}

export const checkUserExists = async (object) => {
    const [rows] = await db.query(`SELECT id from users where ${Object.keys(object)[0]} = ? limit 1`, [Object.values(object)[0]]);
    if (rows.length > 0) {
        return true
    }
    return false;
}

export const createUser = async (
    firstName, lastName, email,
    password,
    contact, role) => {
    const sql = "INSERT INTO users (firstname,lastName,email,password,salt,contact,role,isVerified,createdAt,__v) VALUES (?,?,?,?,?,?,?,?,?,?)";
    let salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash(password, salt);
    
    const [result] = await db.query(sql, [
        firstName, lastName, email, pwd, salt, contact, role, 0, getDateTime(), 0])
    if (result.affectedRows < 1) {
        return false
    }
    return result.insertId
}


export const login = async (email, password) => {
    const [rows] = await db.query("SELECT password,salt from users where email = ?", [email]);

}



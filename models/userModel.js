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


export const increaseLearners = async (num = 1) => {
    await db.query("UPDATE app_state set learners_count = learners_count + ?", [num],)
}


export const increaseAdmins = async (num = 1) => {
    await db.query("UPDATE app_state set admin_count = admin_count + ?", [num],)
}


export const createUser = async (
    firstName, lastName, email,
    password,
    contact, role, created_by = null) => {
    const sql = "INSERT INTO users (firstname,lastName,email,password,salt,contact,role,isVerified,createdAt,__v,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    let salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash(password, salt);

    const [result] = await db.query(sql, [
        firstName, lastName, email, pwd, salt, contact, role, 0, getDateTime(), 0, created_by])
    if (result.affectedRows < 1) {
        return false
    }
    if (role == 'admin') {
        await increaseAdmins()
    }
    else if (role == 'learner') {
        await increaseLearners()
    }
    return result.insertId
}


export const login = async (email, password) => {
    const [rows] = await db.query("SELECT password,salt from users where email = ?", [email]);
}

export const updateUserInfo = async (firstName, lastName, contact, description, id) => {
    const [result] = await db.query("UPDATE users set firstName = ? ,lastName = ?,contact=?,description=?  where id = ? limit 1", [
        firstName, lastName, contact, description, id])
    if (result.affectedRows > 0) {
        await db.query("UPDATE users set __v = __v + 1 where id = ? ", [id])
        return true
    }
    return false
}



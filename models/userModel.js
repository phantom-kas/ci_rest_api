import db from "../db.js"
import { getDateTime, getMonth, standardResponse } from "../utils/utils.js";
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
    await increaseMonthlyLearnerCount(num)
}


export const increaseAdmins = async (num = 1) => {
    await db.query("UPDATE app_state set admin_count = admin_count + ?", [num],)
    await increaseMonthlyAdminCount(num)
}


export const createUser = async (
    firstName, lastName, email,
    password
    , role, created_by = null, phone, location, gender, description, disability) => {
    const sql = "INSERT INTO users (firstname,lastName,email,password,salt,role,isVerified,createdAt,__v,created_by,phone,location,gender,description,disability) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    let salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash(password, salt);

    const [result] = await db.query(sql, [
        firstName, lastName, email, pwd, salt, role, 0, getDateTime(), 0, created_by, phone, location, gender, description, disability])
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

export const updateUserInfo = async (firstName, lastName, description, phone, location, gender, id, disability) => {
    const [result] = await db.query("UPDATE users set firstName = ? ,lastName = ?,description=? ,phone=?,location=? ,gender = ?,disability=?  where id = ? limit 1", [
        firstName, lastName, description, phone, location, gender, disability, id])
    if (result.affectedRows > 0) {
        await db.query("UPDATE users set __v = __v + 1 where id = ? ", [id])
        return true
    }
    return false
}


export const getUserService = async (id) => {
    const [rows] = await db.query("SELECT id,disability,role,description,disability, id,firstName,lastName,email,isVerified,createdAt,__v,location,phone,image,createdAt,gender from users where id = ? limit 1", [id]);
    return rows
}

export const getUserIDByEmail = async (email) => {
    const [rows] = await db.query(`SELECT id from users where email = ? limit 1`, [email]);
    if (rows.length < 1) {
        return false
    }
    return rows[0]['id'];
}


export const updateUserImage = async (id, fileUrl) => {
    const [result] = await db.query("UPDATE users set image = ? , __v = __v+1 where id = ? limit 1", [fileUrl, id],)
    if (result.affectedRows < 1) {
        return false
    }
    return true
}


export const deleteUserService = async (id,) => {
    const [result] = await db.query("UPDATE users set firstName = 'deleted' ,lastName = 'deleted',description='deleted', phone='deleted',location='deleted', gender = 'deleted',image='deleted',email='deleted'  where id = ? limit 1", [id],)
    if (result.affectedRows < 1) {
        return false
    }
    return true
}




export const increaseMonthlyLearnerCount = async (num = 1) => {
    const month = getMonth()
    const [result] = await db.query("UPDATE monthly_state set learners_count = learners_count + ? where month = ? limit 1", [num, month],)
    if (result.affectedRows < 1) {
        await db.query("INSERT INTO monthly_state  (learners_count,month)  values(?,?) limit 1", [num, month])
    }
}

export const increaseMonthlyAdminCount = async (num = 1) => {
    const month = getMonth()
    const [result] = await db.query("UPDATE monthly_state set admins_count = admins_count + ? where month = ? limit 1", [num, month],)
    if (result.affectedRows < 1) {
        await db.query("INSERT INTO monthly_state  (admins_count,month)  values(?,?) limit 1", [num, month])
    }
}
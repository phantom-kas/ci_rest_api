import db from "../db.js"
import { getDateTime, getFutureTimeGMT } from "../utils/utils.js";
import bcrypt from 'bcrypt'

export const getRtoken = async (rtoken) => {
    const [rows] = await db.query("SELECT refreshToken from refreshToken where refreshToken = ? ", [rtoken]);
    return rows
}



export const deleteRefreshToken = async (rtoken) => {
    const [result] = await db.query("DELETE FROM rtokens where token = ?", [rtoken])
    if (result.affectedRow < 1) {
        return false
    }
    return true
}



export const storeRefereshTOken = async (rtoken, user_id) => {
    const [result] = await db.query("INSERT INTO rtokens  (user_id,token,created_at) values (?,?,?) limit 1", [user_id, rtoken, getDateTime()])
    return result.insertId
}

export const getUserForToken = async (user_id) => {
    const [rows] = await db.query("SELECT id, email, role ,firstName,lastName FROM users WHERE id = ?", [user_id]);
    if (rows.length < 1) {
        return false;
    }
    return rows[0];
}



export const getUserLoginDetails = async (email) => {
    const [rows] = await db.query("SELECT id, email, salt , password FROM users WHERE email = ? limit 1", [email]);
    if (rows.length < 1) {
        return false;
    }
    return rows[0];
}

export const getUserSalt = async(id)=>{
     const [rows] = await db.query("SELECT salt FROM users WHERE id = ? limit 1", [id]);
    if (rows.length < 1) {
        return false;
    }
    return rows[0]['salt'];
}


export const storeVerificationCode = async (user_id, code) => {
    let salt = await getUserSalt(user_id);
    if(!salt){
        return false
    }
    let hashedCode = await bcrypt.hash(code+'', salt);
    const [result] = await db.query("UPDATE users set verificationToken = ? ,verificationTokenExpiresAt = ? where id = ? limit 1", [ hashedCode, getFutureTimeGMT(),user_id]);
      if (result.affectedRow < 1) {
        return false
    }
    return true
}
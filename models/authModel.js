import db from "../db.js"
import { getDateTime, getFutureTimeGMT, hashToken } from "../utils/utils.js";
import bcrypt from 'bcrypt'

export const getRtoken = async (rtoken) => {
    const [rows] = await db.query("SELECT token ,ancestor ,is_revoken ,session_id id from rtokens where token = ? limit 1", [rtoken]);
    return rows
}


export const getRtokenByerssionID = async (session_id) => {
    const [rows] = await db.query("SELECT token ,ancestor ,is_revoken, id from rtokens where session_id = ? limit 1", [session_id]);
    return rows
}


export const deleteRefreshToken = async (rtoken) => {
    const [result] = await db.query("DELETE FROM rtokens where token = ?", [rtoken])
    if (result.affectedRow < 1) {
        return false
    }
    return true
}


export const revokeRtokens = async (ancestor) => {
    await db.query("UPDATE rtokens set is_revoken = 1 where ancestor = ? or id = ?", [ancestor,ancestor])
}



export const storeRefereshTOken = async (rtoken, user_id, ancestor = null,uuid=null) => {
    const hashedTkn =await hashToken(rtoken)
    console.log(hashedTkn)
    console.log('=========================================')
    const [result] = await db.query("INSERT INTO rtokens (user_id,token,created_at,ancestor,session_id) values (?,?,?,?,?) limit 1", [user_id, hashedTkn, getDateTime(), ancestor,uuid])
    return result.insertId
}

export const getUserForToken = async (user_id) => {
    const [rows] = await db.query("SELECT id, email, role ,firstName,lastName,isVerified,lastLogin,__v FROM users WHERE id = ?", [user_id]);
    if (rows.length < 1) {
        return false;
    }
    return rows[0];
}

export const updaePassword = async (user_id, password, ) => {
    const [result] = await db.query("UPDATE users set password = ?  where id = ? limit 1", [password, user_id])
    if (result.affectedRow < 1) {
        return false
    }
    return true
}

export const getUSerPassword = async (id)=>{
    const [rows] = await db.query("SELECT id,password from users where  id = ?",[id])
    if(rows.length < 1){
        return false
    }
    return rows[0]['password']
}

export const updateLastLogin = async (id) => {
    const [result] = await db.query("UPDATE users set lastLogin=? where id = ? limit 1", [getDateTime(), id])
    if (result.affectedRow < 1) {
        return false
    }
    return true
}
export const getUserToken = async (user_id) => {
    const [rows] = await db.query("SELECT verificationToken FROM users WHERE id = ? && verificationTokenExpiresAt  > ? limit 1", [user_id, getDateTime()]);
    console.log('------------------------ipipipipppppppppppppppppppp')
    console.log("getUserToken", user_id, getDateTime(), rows)
    if (rows.length < 1) {
        return false;
    }
    return rows[0]['verificationToken'];
}


export const setUserToEmailVerified = async (user_id) => {
    const [result] = await db.query("UPDATE users set isVerified = 1, verificationToken = null, verificationTokenExpiresAt = null where id = ? limit 1", [user_id])
    if (result.affectedRow < 1) {
        return false
    }
    return true
}



export const getUserLoginDetails = async (email) => {
    const [rows] = await db.query("SELECT id, email, salt , password FROM users WHERE email = ? limit 1", [email]);
    if (rows.length < 1) {
        return false;
    }
    return rows[0];
}

export const getUserSalt = async (id) => {
    const [rows] = await db.query("SELECT salt FROM users WHERE id = ? limit 1", [id]);
    if (rows.length < 1) {
        return false;
    }
    return rows[0]['salt'];
}


export const storeVerificationCode = async (user_id, code) => {
    let hashedCode = await bcrypt.hash(code, 10);
    const [result] = await db.query("UPDATE users set verificationToken = ? ,verificationTokenExpiresAt = ? where id = ? limit 1", [hashedCode, getFutureTimeGMT(), user_id]);
    if (result.affectedRow < 1) {
        return false
    }
    return true
}


export const updateUserPassword = async (user_id, password, salt) => {
    const [result] = await db.query("UPDATE users set password = ? ,salt = ? where id = ? limit 1", [password, salt, user_id])
    if (result.affectedRow < 1) {
        return false
    }
    return true
}
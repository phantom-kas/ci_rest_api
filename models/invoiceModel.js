import db from "../db.js";
import { getDateTime } from "../utils/utils.js";



export const addInvoiceService = async (invoice) => {
    const [result] = await db.query("INSERT INTO invoice (amount, created_at, track, status, user, created_by) VALUES (?,?,?,?,?,?)", [invoice.amount, invoice.createdAt, invoice.trackId, invoice.status, invoice.userId, invoice.created_by]);
    return result.insertId
}


export const getUserTrack = async (userId, trackId, cols = "*") => {
    const [rows] = await db.query(`SELECT ${cols} FROM user_track WHERE user = ? AND track = ? LIMIT 1`, [userId, trackId]);
    if (rows.length < 1) {
        return false;
    }
    return rows;
}


export const getInvoiceService = async (where = ' 1', cols = 'id', params = []) => {
    const [rows] = await db.query(`SELECT ${cols} FROM invoice  where ${where} LIMIT 1`, params);
    if (rows.length < 1) {
        return false;
    }
    return rows;
}




export const addUserTrack = async (userId, trackId, amount) => {
    const [result] = await db.query("INSERT INTO user_track (user, track, amount) VALUES (?,?,?)", [userId, trackId, amount]);
    return result.insertId;
}

export const userTrackPayment = async (amount, user, track) => {

}

export const updateInvoicePayment = async (status, amount, last_update, id) => {
    const [result] = await db.query(`UPDATE invoice set status = ? , paid = paid + ? ,last_update=? where id = ? limit 1`, [status, amount, last_update, id],)
    if (result.affectedRows < 1) {
        return false
    }
    return true
}



export const updateUserTrackAmount = async (status, amount,user,track) => {
    const [result] = await db.query(`UPDATE user_track set status = ?,amount = amount + ?  where user = ?
    and   track = ?  limit 1`, [status, amount, user,track],)
    if (result.affectedRows < 1) {
        return false
    }
    return true
}
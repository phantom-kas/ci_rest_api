import { getDateTime, getMonth } from "../utils/utils.js";
import db from "../db.js"


export const createPaymnet = async (amount, reference, status, invoice, iv, user, channel) => {
    const [result] = await db.query("INSERT INTO payments (amount,reference, created_at,created_by,inovice,status,user,iv,channel) VALUES (?,?,?,?,?,?,?,?,?)", [amount, reference, getDateTime(), user, invoice, status, user, iv, channel]);
    if (status != 'paid') {
        return result.insertId;
    }

}


export const updateTotalIncome = async (amount) => {
    await db.query("UPDATE app_state set income = courses_count + ?", [amount],)
    await addMonthlyIncome(amount)
    return true
}

export const getPaymentService = async (where = ' 1', cols = 'id', params = []) => {
    const [rows] = await db.query(`SELECT ${cols} FROM payments  where ${where} LIMIT 1`, [params]);
    if (rows.length < 1) {
        return false;
    }
    return rows;
}


export const updatePayment = async (meta, status, completed_at, id) => {
    const [result] = await db.query(`UPDATE payments set meta_data = ?,status = ? ,completed_at=? where id = ? limit 1`, [meta, status, completed_at, id],)
    if (result.affectedRows < 1) {
        return false
    }
    return true
}


export const addMonthlyIncome = async (amount) => {
    const month = getMonth()
    const [result] = await db.query("UPDATE monthly_state set income = income + ? where month = ?", [amount, month],)
    if (result.affectedRows < 1) {
        await db.query("INSERT INTO monthly_state  (income,month)  values(?,?)", [amount, month])
    }
}


import express from 'express';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';
import { getMonth, getPrevMonth, standardResponse } from '../utils/utils.js';
import db from '../db.js';
const router = express.Router()
router.get('/dashboard', authenticateAtoken, adminProtected, async (req, res, next) => {
    const [rows] = await db.query("SELECT income , invoice_count , learners_count from app_state limit 1");
    const counts = rows[0]
    const thisMonth = getMonth()
    const prevMonth = getPrevMonth()
    let [thisMonthData] = await db.query("SELECT learners_count, income, invoice_count from monthly_state where month = ?", [thisMonth]);
    let [prevMonthData] = await db.query("SELECT learners_count, income, invoice_count from monthly_state where month = ?", [prevMonth]);
    if (thisMonthData.length < 1) {
        thisMonthData = { learners_count: 0, income: 0, invoice_count: 0 }
    } else {
        thisMonthData = thisMonthData[0]
    }
    if (prevMonthData.length < 1) {
        prevMonthData = { learners_count: 0, income: 0, invoice_count: 0 }
    } else {
        prevMonthData = prevMonthData[0]
    }
    const [revenueChartData] = await db.query("SELECT income,month , created_at from monthly_state where created_at  >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) ORDER BY month ASC LIMIT 12");
    return standardResponse(res, 200, { counts, prevMonthData, thisMonthData, revenueChartData })
})

router.get('/yearcount/:year', authenticateAtoken, adminProtected, async (req, res, next) => {
    const year = req.params.year
    let dirstday = year + '-01-01'
    let lastDay = year + '-12-31'
    const [ChartData] = await db.query("SELECT income,month,learners_count , created_at from monthly_state where created_at  >= ? && created_at <= ? LIMIT 12", [dirstday, lastDay]);
    return standardResponse(res, 200, ChartData)
})

export default router

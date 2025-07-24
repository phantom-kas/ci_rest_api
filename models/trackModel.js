import db from "../db.js"
import { getDateTime, getMonth } from "../utils/utils.js"

export const increaseCourseTrack = async (num = 1) => {
    await db.query("UPDATE app_state set tracks_count = tracks_count + ?", [num],)
    await increaseMonthlyTrackCount()
}


export const createTrack = async (req, title, description, duration, price, fileUrl, instructor) => {
    const [result] = await db.query("INSERT INTO  track (created_at,price,created_by,name,duration,description,image,Instructor) values (?,?,?,?,?,?,?,?)", [
        getDateTime(), price, req.user.id, title, duration, description, fileUrl, instructor])
    if (result.affectedRows < 1) {
        return false
    }
    return result.insertId
}

export const increaseMonthlyTrackCount = async (num) => {
    const month = getMonth()
    const [result] = await db.query("UPDATE app_state set tracks_count = tracks_count + ?", [month, num],)
    if (result.affectedRows < 1) {
        await db.query("INSERT INTO app_state  (tracks_count,nonth)  values(?,?)", [num, month])
    }
}


export const checkTrackExists = async (object) => {
    console.log('----------------------')
    console.log(object)
    console.log('----------------------')
    const [rows] = await db.query(`SELECT id from track where ${Object.keys(object)[0]} = ? limit 1`, [Object.values(object)[0]]);
    console.log(rows)
    if (rows.length > 0) {
        return true
    }
    return false;
}


export const getTracksDb = async (cols = '*') => {
    const [rows] = await db.query(`SELECT ${cols} from track where 1 order by id desc`);
    return rows;
}
import db from "../db.js"
import { getDateTime, standardResponse } from "../utils/utils.js";


export const checkTrackExists = async (object) => {
    const [rows] = await db.query(`SELECT id from track where ${Object.keys(object)[0]} = ? limit 1`, [Object.values(object)[0]]);
    if (rows.length > 0) {
        return true
    }
    return false;
}

export const checkCourseExists = async (object) => {
    const [rows] = await db.query(`SELECT id from course where ${Object.keys(object)[0]} = ? limit 1`, [Object.values(object)[0]]);
    if (rows.length > 0) {
        return true
    }
    return false;
}

export const increaseCourseCount = async (num = 1) => {
    await db.query("UPDATE app_state set courses_count = courses_count + ?", [num],)
}


export const createCourse = async (req, title, description, track) => {
    const [result] = await db.query("INSERT INTO  courses (created_at,created_by,title,description,track,num_enroled) values (?,?,?,?,?,?)", [
        getDateTime(), req.user.id, title, description, track, 0])
    if (result.affectedRows < 1) {
        return false
    }
    return result.insertId
}
import db from "../db.js"
import { getDateTime, getMonth, standardResponse } from "../utils/utils.js";




export const checkCourseExistsService = async (object) => {
    const [rows] = await db.query(`SELECT id from courses where ${Object.keys(object)[0]} = ? limit 1`, [Object.values(object)[0]]);
    if (rows.length > 0) {
        return true
    }
    return false;
}

export const increaseCourseCountService = async (track, num = 1) => {
    await db.query("UPDATE app_state set courses_count = courses_count + ?", [num],)
    await increaeseTrackCoursesService(track, num);
    await increaseMonthlyCoursesCountService(num);
}

export const increaeseTrackCoursesService = async (track, num = 1) => {
    await db.query("UPDATE track set num_courses = num_courses + ? where id = ? ", [num, track],)
}


export const increaseMonthlyCoursesCountService = async (num = 1) => {
    const month = getMonth()
    const [result] = await db.query("UPDATE monthly_state set courses_count = courses_count + ? where month = ?", [ num,month],)
    if (result.affectedRows < 1) {
        await db.query("INSERT INTO monthly_state  (courses_count,month)  values(?,?)", [num, month])
    }
}


export const getCoursesService = async (cols = '*', where = '1', params = undefined) => {
    const [rows] = await db.query(`SELECT ${cols} from courses where ${where}`, params);
    return rows;
}


export const getCoursesService2 = async (limit, lastId = null) => {
    let queryParams = [limit];
    let where = "";
    let lastSql = ''
    if (lastId) {
        lastSql = ' && c.id < ? '
        queryParams.unshift(lastId)

        console.log(queryParams)
    }
    const [rows] = await db.query(`SELECT c.id, c.image,c.title,c.track , t.name as trackName,c.created_at from courses as c inner join track as t on c.track = t.id where 1 ${lastSql} ORDER BY c.id DESC LIMIT ?`, queryParams);
    return rows;
}

export const createCourseService = async (req, title, description, track, fileUrl) => {
    const [result] = await db.query("INSERT INTO  courses (created_at,created_by,title,description,track,num_enroled,image) values (?,?,?,?,?,?,?)", [
        getDateTime(), req.user.id, title, description, track, 0, fileUrl])
    if (result.affectedRows < 1) {
        return false
    }
    return result.insertId
}


export const deleteCourseByIdService = async (courseId) => {
    const [result] = await db.query("DELETE FROM courses WHERE id = ?", [courseId]);
    if (result.affectedRows < 1) {
        return false
    }
    return true;
}


export const reducMonthlyCoursesCount = async (num = 1) => {
    const month = getMonth()
    const [result] = await db.query("UPDATE monthly_state set courses_count = courses_count - ? where month = ?", [num, month],)
    if (result.affectedRows < 1) {
        return false
    }
    return true;
}


export const updateCourseDb = async (title, track, description, id) => {
    const [result] = await db.query("UPDATE courses set title=? , track =? ,description = ? where id = ? limit 1", [title, track, description, id])
    if (result.affectedRows < 1) {
        return false
    }
    return true
}

export const updateV = async (id)=>{
 await db.query("UPDATE courses set __v = __v + 1 where id = ?",[id])
}
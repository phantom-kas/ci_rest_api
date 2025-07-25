import db from "../db.js"
import { getDateTime, getMonth, standardResponse } from "../utils/utils.js";




export const checkCourseExists = async (object) => {
    const [rows] = await db.query(`SELECT id from courses where ${Object.keys(object)[0]} = ? limit 1`, [Object.values(object)[0]]);
    if (rows.length > 0) {
        return true
    }
    return false;
}

export const increaseCourseCount = async (track, num = 1) => {
    await db.query("UPDATE app_state set courses_count = courses_count + ?", [num],)
    await increaeseTrackCourses(track, num);
    await increaseMonthlyCoursesCount(num);
}

export const increaeseTrackCourses = async (track, num = 1) => {
    await db.query("UPDATE track set num_courses = num_courses + ? where id = ? ", [num, track],)
}


export const increaseMonthlyCoursesCount = async (num = 1) => {
    const month = getMonth()
    const [result] = await db.query("UPDATE app_state set courses_count = courses_count + ?", [month, num],)
    if (result.affectedRows < 1) {
        await db.query("INSERT INTO app_state  (courses_count,nonth)  values(?,?)", [num, month])
    }
}


export const getCoursesDb = async (cols = '*', where = '1', params = undefined) => {
    const [rows] = await db.query(`SELECT ${cols} from courses where ${where}`, params);
    return rows;
}


export const getCoursesDb2 = async (limit, lastId = null) => {
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

export const createCourse = async (req, title, description, track, fileUrl) => {
    const [result] = await db.query("INSERT INTO  courses (created_at,created_by,title,description,track,num_enroled,image) values (?,?,?,?,?,?,?)", [
        getDateTime(), req.user.id, title, description, track, 0, fileUrl])
    if (result.affectedRows < 1) {
        return false
    }
    return result.insertId
}


export const deleteCourseById = async (courseId) => {
    const [result] = await db.query("DELETE FROM courses WHERE id = ?", [courseId]);
    if (result.affectedRows < 1) {
        return false
    }
    return true;
}


export const reduceTrackCourses = async (track) => {
    const [result] = await db.query("UPDATE track set num_courses = num_courses - 1 where id = ? ", [track],)
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


export const editImageDb =async (filename,id)=>{
     const [result] = await db.query("UPDATE courses set image = ? , __v = __v+1 where id = ? limit 1", [filename, id],)
    if (result.affectedRows < 1) {
      return false
    }
    return true
}
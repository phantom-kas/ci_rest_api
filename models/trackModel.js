import db from "../db.js"
import { getDateTime, getMonth } from "../utils/utils.js"

export const increaseCourseTrack = async (num = 1) => {
    await db.query("UPDATE app_state set tracks_count = tracks_count + ?", [num],)
    await increaseMonthlyTrackCount(num)
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


export const getTracksDb = async (cols = '*' , where = ' 1',queryParams=[]) => {
    const [rows] = await db.query(`SELECT ${cols} from track where ${where} `,queryParams);
    return rows;
}

export const deleteTrackId = async (trackId) => {
    const [result] = await db.query("DELETE FROM track WHERE id = ?", [trackId]);
    if (result.affectedRows < 1) {
        return false
    }
    return true;
}

export const editImageDb =async (filename,id)=>{
     const [result] = await db.query("UPDATE track set image = ? , __v = __v+1 where id = ? limit 1", [filename, id],)
    if (result.affectedRows < 1) {
      return false
    }
    return true
}
export const updateTrackDb = async (description, price, duration, instructor, title,id)=>{
    const [result] = await db.query("UPDATE track set price = ?,name = ?,duration = ?,description = ?,Instructor=? where id = ? limit 1", [price,title,duration,description,instructor, id],)
    if (result.affectedRows < 1) {
      return false
    }
    return true
}


export const updateV = async (id)=>{
 await db.query("UPDATE track set __v = __v + 1 where id = ?",[id])
}
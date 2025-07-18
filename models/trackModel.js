export const increaseCourseTrack = async (num = 1) => {
    await db.query("UPDATE app_state set tracks_count = tracks_count + ?", [num],)
    await increaseMonthlyTrackCount()
}


export const createTrack = async (req, title, description,duration,price) => {
    const [result] = await db.query("INSERT INTO  courses (created_at,price,created_by,name,duration,description) values (?,?,?,?,?,?)", [
        getDateTime(),price, req.user.id, title, duration,description])
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
    const [rows] = await db.query(`SELECT id from track where ${Object.keys(object)[0]} = ? limit 1`, [Object.values(object)[0]]);
    if (rows.length > 0) {
        return true
    }
    return false;
}
import db from "../db.js"


export const getTrackService =async (id,user) => {
    const [rows] = await db.query(`SELECT ut.id as utid, ut.user,rating,num_rating,ratings_deatails,total_ratings, t.price,t.description,t.image,t.duration,t.name,t.duration,t.num_courses,t.Instructor,t.__v,t.id from track as t left outer join user_track as ut on ut.track = t.id and (ut.user = ? || ut.user is null)  where t.id = ? LIMIT 1`,[user,id]);
    return rows;
}
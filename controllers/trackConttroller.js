import db from "../db.js";
import { getTrackService } from "../models/learnerModel.js";
import { checkTrackExists, createTrack, deleteTrackId, getTrackCourses, getTracksDb, increaseCourseTrack, updateTrackDb, updateV } from "../models/trackModel.js";
import { deleteFile, getPaginationService, handleUpload, standardResponse } from "../utils/utils.js";

export const addTrack = async (req, res, next) => {
    try {
        console.log('------------------------')
        console.log(req.body)
        console.log('------------------------')
        const { description, price, duration, instructor, title } = req.body
        if (await checkTrackExists({ name: title })) {
            return standardResponse(res, 400, undefined, 'Track exits with same title')
        }
        const fileUrl = await handleUpload(req);
        const track = await createTrack(req, title, description, duration, (parseInt(price + '') * 100), fileUrl, instructor);
        if (track) {
            await increaseCourseTrack()

            return standardResponse(res, 200, { id: track }, 'Track created successfully')
        }
        return standardResponse(res, 400, undefined, 'Something when wrong')
    }
    catch (err) {
        next(err)
    }
}


export const getTracksOptions = async (req, res, next) => {
    const tracks = await getTracksDb(' id , name ');
    standardResponse(res, 200, tracks)
    return
}

export const getTracks = async (req, res, next) => {
    const lastId = parseInt(req.query.lastId) || null;
    let limit = parseInt(req.query.limit) || 10;

    let order = '';

    let where = '';
    let params = []

    if (req.query.search != undefined) {
        where += ' and (t.name like ?  || t.Instructor like ?)';
        params.push('%' + req.query.search + '%')
        params.push('%' + req.query.search + '%')
        // adssa
    }
    if (req.query.orderbyratds) {
        order = ' t.rating DESC ,';
    }
    const tracks = await getPaginationService(`SELECT t.id,t.total_ratings,t.num_rating, t.name ,t.price,description,t.image,t.duration,t.num_courses,t.Instructor ,
         (SELECT GROUP_CONCAT(c.title)
    FROM courses  as c
    WHERE c.track = t.id
    LIMIT 2) AS courses
   from track as t
        `, 't.id', limit, lastId, where, params, order);
    standardResponse(res, 200, tracks)
    return
}

export const deleteTrack = async (req, res, next) => {
    try {
        const id = req.params.id
        const track = await getTracksDb(' id , image ', '  id = ? limit 1 ', [id])

        if (track.length < 1) {
            return standardResponse(res, 404, undefined, 'Track not found')
        }

        await deleteTrackId(id);
        await increaseCourseTrack(-1);

        await deleteFile(track[0]['image'], res,req);

        return standardResponse(res, 200, undefined, ' Delete Successfull')
    }
    catch (err) {
        next(err)
    }
}



export const updateTrack = async (req, res, next) => {
    try {
        const { id } = req.params
        const { description, price, duration, instructor, title } = req.body
        const track = await getTracksDb(' id ', '  id = ? limit 1 ', [id]);
        if (track.length < 1) {
            return standardResponse(res, 400, undefined, ' Track not found')
        }
        if (!await updateTrackDb(description, price, duration, instructor, title, id)) {
            return standardResponse(res, 400, undefined, ' Nothing to update')
        }
        await updateV(id)

        return standardResponse(res, 200, undefined, 'Update successfull')

    } catch (err) {
        next(err)
    }
}



export const getTrack = async (req, res, next) => {
    try {
        const id = req.params.id
        const track = await getTracksDb('price,description,image,duration,name,duration,num_courses,Instructor,__v,id ', '  id = ? limit 1 ', [id])

        return standardResponse(res, 200, track)
    } catch (err) {
        next(err)
    }
}


export const getTrackAndCourses = async (req, res, next) => {
    try {
        const id = req.params.id
        const courses = await getTrackCourses(id)
        const track = await getTrackService(id);
        return standardResponse(res, 200, { track, courses })

    } catch (err) {
        next(err)
    }
}


export const getTrackLearners = async (req, res, next) => {
    const lastId = parseInt(req.query.lastId) || null;
    let limit = parseInt(req.query.limit) || 10;
    const id = req.params.id
    const trackLearners = await getPaginationService(`SELECT ut.created_at, ut.id, u.id as user_id, u.image,u.firstname,u.lastName,ut.status,ut.amount from user_track as ut inner join users as u on u.id = ut.user `, 'ut.id', limit, lastId, ' && ut.track = ? ', [id]);
    standardResponse(res, 200, trackLearners)
}


export const getLearnerTracks = async (req, res, next) => {
    try {
        const userid = req.user.id
        const [tracks] = await db.query("SELECT t.id,t.name from track as t inner join user_track as ut on ut.track = t.id  where ut.user=?", [userid])


        return standardResponse(res, 200, tracks)
    } catch (err) {
        next(err)
    }
}



export const getTracksChat = async (req, res, next) => {
    const [tracks] = await db.query("SELECT num_enroled,income,name from track")


    return standardResponse(res, 200, tracks)
}


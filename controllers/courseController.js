import { checkCourseExistsService, createCourseService, deleteCourseByIdService, getCoursesService, getCoursesService2, increaeseTrackCoursesService, increaseCourseCountService, updateCourseDb, updateV } from "../models/courseModel.js";
import { checkTrackExists } from "../models/trackModel.js";
import { deleteFile, getPaginationService, handleUpload, standardResponse } from "../utils/utils.js";

export const addCourse = async (req, res, next) => {
    try {
        const { track, title, description } = req.body
        if (!await checkTrackExists({ id: track })) {
            return standardResponse(res, 400, undefined, 'Track not found')
        }
        if (await checkCourseExistsService({ title: title })) {
            return standardResponse(res, 400, undefined, 'There is a course with the name title please choose another one')
        }
        const fileUrl = await handleUpload(req);
        const course = await createCourseService(req, title, description, track, fileUrl);
        if (course) {
            await increaseCourseCountService(track)
            return standardResponse(res, 200, { id: course }, 'Course created successfully')
        }
        return standardResponse(res, 400, { id: course }, 'Something when wrong')
    }
    catch (err) {
        next(err)
    }
}


export const getCourses = async (req, res, next) => {
    try {
        const lastId = parseInt(req.query.lastId) || null;
        let limit = parseInt(req.query.limit) || 10;
        let params = []
        let where = '';

        if (req.query.search != undefined) {
            where += ' and (c.title like ? || t.name like ? || t.Instructor like ?)';
            params.push('%' + req.query.search + '%')
            params.push('%' + req.query.search + '%')
            params.push('%' + req.query.search + '%')
        }
        let sql = `SELECT c.id, c.image,c.title,c.track , t.name as trackName,c.created_at from courses as c inner join track as t on c.track = t.id `

        const rows = await getPaginationService(sql, 'c.id', limit, lastId, where, params);

        return standardResponse(res, 200, rows)
    }
    catch (err) {
        next(err)
    }
}


export const deleteCourse = async (req, res, next) => {
    try {
        const id = req.params.id
        const course = await getCoursesService(' id,image,track ', ' id = ? limit 1 ', [id])
        if (course.length < 1) {
            return standardResponse(res, 400, undefined, 'Course not found');
        }
        if (!await deleteCourseByIdService(id)) {
            return standardResponse(res, 400, undefined, 'UNkown error. \n Please try again later');
        }
        await deleteFile(course[0]['image'], res);
        await increaseCourseCountService(course[0]['track'], -1)
        return standardResponse(res, 200, undefined, ' Delete Successfull')
    }
    catch (err) {
        next(err)
    }
}

export const getcourse = async (req, res, next) => {
    try {
        const id = req.params.id
        return standardResponse(res, 200, await getCoursesService('*', ' id = ? limit 1', [id]))
    }
    catch (err) {
        next(err)
    }
}


export const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params
        const { track, title, description } = req.body
        const course = await getCoursesService(' track, title, description', ' id = ? limit 1', [id]);
        if (course.length < 1) {
            return standardResponse(res, 400, undefined, ' Course not found')
        }
        console.log(track, title, description, id)
        if (!await updateCourseDb(title, track, description, id)) {
            return standardResponse(res, 400, undefined, ' Nothing to update')
        }
        await updateV(id)
        if (track != course[0]['track']) {
            await increaeseTrackCoursesService(course[0]['track'], -1)
            await increaeseTrackCoursesService(track, 1)
        }
        return standardResponse(res, 200, undefined, 'Update successful')
    }
    catch (err) {
        next(err)
    }
}




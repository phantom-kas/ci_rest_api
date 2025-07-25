import { checkCourseExists, createCourse, deleteCourseById, editImageDb, getCoursesDb, getCoursesDb2, increaeseTrackCourses, increaseCourseCount, reduceTrackCourses, reducMonthlyCoursesCount, updateCourseDb, updateV } from "../models/courseModel.js";
import { checkTrackExists } from "../models/trackModel.js";
import { deleteFile, handleUpload, standardResponse } from "../utils/utils.js";




export const addCourse = async (req, res, next) => {
    try {
        const { track, title, description } = req.body
        if (!await checkTrackExists({ id: track })) {
            return standardResponse(res, 400, undefined, 'Track not found')
        }
        if (await checkCourseExists({ title: title })) {
            return standardResponse(res, 400, undefined, 'There is a course with the name title please choose another one')
        }
        let allowedMimeTypes = ['image/jpeg', 'image/png']
        const fileUrl = await handleUpload(req);
        const course = await createCourse(req, title, description, track, fileUrl);
        if (course) {
            await increaseCourseCount(track)
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
        limit++
        console.log('last id =----------------' + lastId)
        // const offset = (page - 1) * limit;
        // const search = req.query.search || '';

        const rows = await getCoursesDb2(limit, lastId);
        return standardResponse(res, 200, rows)
    }
    catch (err) {
        next(err)
    }
}


export const deleteCourse = async (req, res, next) => {
    try {
        const id = req.params.id
        const course = await getCoursesDb(' id,image,track ', ' id = ? limit 1 ', [id])
        if (course.length < 1) {
            return standardResponse(res, 400, undefined, 'Course not found');
        }
        if (!await deleteCourseById(id)) {
            return standardResponse(res, 400, undefined, 'UNkown error. \n Please try again later');
        }
        await deleteFile(course[0]['image'], res);

        
        await reduceTrackCourses(course[0]['track'])

        await reducMonthlyCoursesCount(1)

        return standardResponse(res, 200, undefined, ' Delete Successfull')
    }
    catch (err) {
        next(err)
    }
}

export const getcourse = async (req, res, next) => {
    try {
        const id = req.params.id
        return standardResponse(res, 200, await getCoursesDb('*', ' id = ? limit 1', [id]))
    }
    catch (err) {
        next(err)
    }
}

export const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params
        const { track, title, description } = req.body
        const course =await getCoursesDb(' track, title, description', ' id = ? limit 1', [id]);
        if (course.length < 1) {
            return standardResponse(res, 400, undefined, ' Course not found')
        }

        console.log( track, title, description ,id)
        if (!await updateCourseDb( title,track, description, id)) {
            return standardResponse(res, 400, undefined, ' Nothing to update')
        }
        await updateV(id)

        if (track != course[0]['track']) {
            await increaeseTrackCourses(course[0]['track'], -1)
            await increaeseTrackCourses(track, 1)
        }
        return standardResponse(res, 200, undefined, 'Update successful')
    }
    catch (err) {
        next(err)
    }
}



export const editImage = async (req, res, next) => {
    try {
        const id = req.params.id
        const track = await getCoursesDb(' image ', '  id = ? limit 1 ', [id])
        console.log(id)
        console.log(track)
        await deleteFile(track[0]['image'], res);
        const fileUrl = await handleUpload(req);
        await editImageDb(fileUrl, id)
        return standardResponse(res, 200, undefined, ' Update Successfull')
    }
    catch (err) {
        next(err)
    }
}
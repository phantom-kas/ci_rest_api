import { checkCourseExists, createCourse, getCoursesDb, getCoursesDb2, increaseCourseCount } from "../models/courseModel.js";
import { checkTrackExists } from "../models/trackModel.js";
import { handleUpload, standardResponse } from "../utils/utils.js";




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
        const fileUrl = await handleUpload(req, { allowedMimeTypes });
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
        console.log('last id =----------------'+lastId)
        // const offset = (page - 1) * limit;
        // const search = req.query.search || '';

        const rows = await getCoursesDb2(limit,lastId);
        return standardResponse(res, 200, rows)
    }
    catch (err) {
        next(err)
    }
}
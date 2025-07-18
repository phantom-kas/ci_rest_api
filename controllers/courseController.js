import {  createCourse, increaseCourseCount } from "../models/courseModel.js";
import { checkTrackExists } from "../models/trackModel.js";
import { standardResponse } from "../utils/utils.js";



export const addCourse = async (req, res, next) => {
    try {
        const { track, title, description } = req.body
        if (checkTrackExists({ id: track })) {
            return standardResponse(res, 400, undefined, 'Track not found')
        }
        const course = await createCourse(req, title, description, track);
        if (course) {
            await increaseCourseCount()
            return standardResponse(res, 200, { id: course }, 'Course created successfully')
        }
            return standardResponse(res, 400, { id: course }, 'Something when wrong')
    }
    catch (err) {
        next(err)
    }
}

import { checkTrackExists, createTrack, increaseCourseTrack } from "../models/trackModel.js";
import { standardResponse } from "../utils/utils.js";

export const addTrack = async (req, res, next) => {
    try {
        const { title, description, price, duration } = req.body
        if (checkTrackExists({ name: title })) {
            return standardResponse(res, 400, undefined, 'Track not found')
        }
        const track = await createTrack(req, title, description, duration, price);
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
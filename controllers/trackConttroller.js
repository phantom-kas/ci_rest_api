import { checkTrackExists, createTrack, getTracksDb, increaseCourseTrack } from "../models/trackModel.js";
import { handleUpload, standardResponse } from "../utils/utils.js";

export const addTrack = async (req, res, next) => {
    try {
        console.log('------------------------')
        console.log(req.body)
        console.log('------------------------')

        const { description, price, duration, instructor, title } = req.body
        if (await checkTrackExists({ name: title })) {
            return standardResponse(res, 400, undefined, 'Track exits with same title')
        }
        let allowedMimeTypes = ['image/jpeg', 'image/png']
        const fileUrl = await handleUpload(req, { allowedMimeTypes });
        const track = await createTrack(req, title, description, duration, price * 100, fileUrl, instructor);
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
    const tracks = await getTracksDb();
    standardResponse(res, 200, tracks)
    return
}
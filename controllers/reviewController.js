import { createREviewService, getTrackReviewData, hasReviewedTrack, updateTrackReviewData } from "../models/reviewModel.js"
import { getPaginationService, standardResponse } from "../utils/utils.js"


export const createReview = async (req, res, next) => {
    const { review, rating, track } = req.body
    const userId = req.user.id
    console.log('---------creating eview-----------------------')
    if (await hasReviewedTrack(userId, track)) {
        return standardResponse(res, 400, undefined, "You can't review a track more than once");
    }
    const tracReviewData = await getTrackReviewData(track)
    let newRatingDetailes = {}
    if (tracReviewData[0]['ratings_deatails']) {

        newRatingDetailes = JSON.parse(tracReviewData[0]['ratings_deatails'])
    }
    if (newRatingDetailes[rating]) {
        newRatingDetailes[rating] += 1
    }
    else {
        newRatingDetailes[rating] = 1
    }
    const totalRatings = tracReviewData[0]['total_ratings'] + rating
    const numRating = tracReviewData[0]['num_rating'] + 1
    const newRating = totalRatings / numRating
    await updateTrackReviewData(track, totalRatings, newRatingDetailes, numRating, newRating)
    const revId = await createREviewService(userId, track, review, rating)
    return standardResponse(res, 200, { id: revId }, 'Review created successfully')
}


export const getReviews = async (req, res, next) => {
    const lastId = parseInt(req.query.lastId) || null;
    let limit = parseInt(req.query.limit) || 10;
    let where = '';
    let params = [];
    if(req.query.track){
        where = ' AND r.track = ?'
        params = [req.query.track]
    }
    const invoices = await getPaginationService(`SELECT r.id, u.image ,u.firstname,u.lastName ,r.created_at,r.review,r.rating from users as u INNER JOIN reviews as r on r.created_by = u.id`, 'r.id', limit, lastId,where,params);
    standardResponse(res, 200, invoices)
    return
}
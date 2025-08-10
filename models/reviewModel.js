import db from "../db.js"
import { getDateTime } from "../utils/utils.js"


export const hasReviewedTrack = async (userId, trackId) => {
    const [rows] = await db.query("SELECT id from reviews where created_by = ? and track = ? limit 1", [userId, trackId])
    if (rows.length > 0) {
        return true
    }
    return false
}


export const createREviewService = async (userId, trackId, Review,rating) => {
    const [result] = await db.query("INSERT into reviews (track, created_by,review,created_at,rating) values (?,?,?,?,?)", [trackId, userId, Review, getDateTime(),rating])
    return result.insertId

}


export const getTrackReviewData = async (trackId) => {
    const [rows] = await db.query("SELECT total_ratings,ratings_deatails	,num_rating,rating from track  where id = ?", [trackId])
    if (rows.length < 1) {
        return false
    }
    return rows
}


export const updateTrackReviewData = async (trackId, totalRatings, ratingsDetails, numRating, rating) => {
    const [result] = await db.query("UPDATE track set total_ratings = ?, ratings_deatails = ?, num_rating = ?, rating = ? where id = ? limit 1", [totalRatings, JSON.stringify(ratingsDetails), numRating, rating, trackId])
    if (result.affectedRows < 1) {
        return false
    }
    return true
}
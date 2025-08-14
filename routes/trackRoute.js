import express from 'express';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';
import {  trackSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { addTrack, deleteTrack, getTrack, getTrackAndCourses, getTrackLearners, getTracks, getTracksOptions, updateTrack } from '../controllers/trackConttroller.js';
import { createUploadMiddleware } from '../config/multer.js';
import { editImageUtil } from '../utils/utils.js';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
const upload = createUploadMiddleware(allowedMimeTypes);
const router = express.Router()
router.post('/track', authenticateAtoken, adminProtected,(req,res,next)=>validateUserRequest(req,res,next,trackSchema),upload.single('file'), addTrack)
router.delete('/track/:id', authenticateAtoken, adminProtected, deleteTrack)
router.get('/tracks',getTracks);
router.put('/track/:id',authenticateAtoken, adminProtected,(req,res,next)=>validateUserRequest(req,res,next,trackSchema),updateTrack);
router.get('/tracks/options',getTracksOptions);
router.get('/track/:id',getTrack);
router.get('/track-learners',authenticateAtoken,adminProtected,getTrackLearners);
router.get('/track-courses/:id',getTrackAndCourses);
router.put('/track/image/:id', authenticateAtoken,upload.single('file'), adminProtected, (req, res, next) => editImageUtil(req, res, next, 'track'));
export default router
import express from 'express';
import { addCourse } from '../controllers/courseController.js';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';
import { courseSchema, trackSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { addTrack, deleteTrack, editImage, getTrack, getTrackAndCourses, getTracks, getTracksOptions, updateTrack } from '../controllers/trackConttroller.js';
import multer from 'multer';
import { createUploadMiddleware } from '../config/multer.js';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
const upload = createUploadMiddleware(allowedMimeTypes);
const router = express.Router()
router.post('/track', authenticateAtoken, adminProtected,(req,res,next)=>validateUserRequest(req,res,next,trackSchema),upload.single('file'), addTrack)
router.delete('/track/:id', authenticateAtoken, adminProtected, deleteTrack)
router.get('/tracks',getTracks);
router.put('/track/:id',authenticateAtoken, adminProtected,(req,res,next)=>validateUserRequest(req,res,next,trackSchema),updateTrack);
router.get('/tracks/options',getTracksOptions);
router.get('/track/:id',getTrack);
router.get('/track-courses/:id',getTrackAndCourses);
router.put('/track/image/:id', authenticateAtoken,upload.single('file'), adminProtected,editImage);
export default router
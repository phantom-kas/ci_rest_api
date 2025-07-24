import express from 'express';
import { addCourse } from '../controllers/courseController.js';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';
import { courseSchema, trackSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { addTrack, getTracks, getTracksOptions } from '../controllers/trackConttroller.js';
import multer from 'multer';
import { createUploadMiddleware } from '../config/multer.js';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
const upload = createUploadMiddleware(allowedMimeTypes);
const router = express.Router()
router.post('/track', authenticateAtoken, adminProtected,(req,res,next)=>validateUserRequest(req,res,next,trackSchema),upload.single('file'), addTrack)
router.get('/tracks',getTracks);
router.get('/tracks/options',getTracksOptions);
export default router
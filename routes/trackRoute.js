import express from 'express';
import { addCourse } from '../controllers/courseController.js';
import { adminProjected, authenticateAtoken } from '../middleware/auth.js';
import { courseSchema, trackSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { addTrack } from '../controllers/trackConttroller.js';

const router = express.Router()
router.post('/track', authenticateAtoken, adminProjected,(req,res,next)=>validateUserRequest(req,res,next,trackSchema), addTrack)
export default router
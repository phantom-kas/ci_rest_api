import express from 'express';
import { addCourse } from '../controllers/courseController.js';
import { adminProjected, authenticateAtoken } from '../middleware/auth.js';
import { courseSchema, validateUserRequest } from '../middleware/userInputValidator.js';

const router = express.Router()
router.post('/course', authenticateAtoken, adminProjected,(req,res,next)=>validateUserRequest(req,res,next,courseSchema), addCourse)
export default router
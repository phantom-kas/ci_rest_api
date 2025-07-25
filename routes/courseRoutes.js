import express from 'express';
import { addCourse, deleteCourse, editImage, getcourse, getCourses, updateCourse } from '../controllers/courseController.js';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';
import { courseSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { createUploadMiddleware } from '../config/multer.js';


const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
const upload = createUploadMiddleware(allowedMimeTypes);
const router = express.Router()
router.post('/course', authenticateAtoken, adminProtected, (req, res, next) => validateUserRequest(req, res, next, courseSchema), upload.single('file'), addCourse)
router.get('/courses', getCourses)
router.put('/course/:id', authenticateAtoken, adminProtected, (req, res, next) => validateUserRequest(req, res, next, courseSchema), updateCourse)
router.get('/course/:id', getcourse)
router.delete('/course/:id', authenticateAtoken, adminProtected, deleteCourse)
router.put('/course/image/:id', authenticateAtoken, upload.single('file'), adminProtected, editImage);

export default router
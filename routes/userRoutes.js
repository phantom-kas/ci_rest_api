
import express from 'express';
import { getAllUsers, createAdmin, createLearner, updateUser, getUser, deleteUser, getAllUser2 } from '../controllers/userController.js';
import { validateUserRequest, userSchema, updateUserInfoSchema, } from '../middleware/userInputValidator.js';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';
import { createUploadMiddleware, ensureFilePresent } from '../config/multer.js';
import { editImageUtil } from '../utils/utils.js';

const allowedMimeTypes = ['image/jpeg', 'image/png'];

const router = express.Router()
const upload = createUploadMiddleware(allowedMimeTypes);

router.get('/users',authenticateAtoken,adminProtected, getAllUsers)
router.get('/users/options',authenticateAtoken,adminProtected, getAllUser2)

router.get('/user/:id', getUser)
router.post('/user/admin', (req, res, next) => validateUserRequest(req, res, next, userSchema), upload.single('file'),ensureFilePresent,createAdmin)
router.post('/user/learner', (req, res, next) => validateUserRequest(req, res, next, userSchema), upload.single('file'),ensureFilePresent,createLearner)
router.put('/user/:id',authenticateAtoken, (req, res, next) => validateUserRequest(req, res, next, updateUserInfoSchema), updateUser)
router.delete('/user/:id',authenticateAtoken, adminProtected, deleteUser)
router.put('/user/image/:id', authenticateAtoken,upload.single('file'), authenticateAtoken,(req, res, next) => editImageUtil(req, res, next, 'users'));

export default router
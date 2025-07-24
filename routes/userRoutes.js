
import express from 'express';
import { getAllUsers, createAdmin, createLearner, updateUser } from '../controllers/userController.js';
import { validateUserRequest, userSchema, generateRtokenSchema, loginSchema, updateUserInfoSchema, } from '../middleware/userInputValidator.js';
import { adminProtected, authenticateAtoken } from '../middleware/auth.js';


const router = express.Router()

router.get('/user', getAllUsers)
router.post('/user/admin', (req, res, next) => validateUserRequest(req, res, next, userSchema), createAdmin)
router.post('/user/learner', (req, res, next) => validateUserRequest(req, res, next, userSchema), createLearner)
router.put('/user/:id',authenticateAtoken, (req, res, next) => validateUserRequest(req, res, next, updateUserInfoSchema), updateUser)


export default router
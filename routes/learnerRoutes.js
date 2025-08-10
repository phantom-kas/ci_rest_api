import express from 'express';
import {  authenticateAtoken } from '../middleware/auth.js';
import {createLearner, getTrack} from '../controllers/learnerController.js'
import { userSchema, validateUserRequest } from '../middleware/userInputValidator.js';

const router = express.Router()
router.get('/learner/track/:id',authenticateAtoken,getTrack);
router.post('/learner', (req, res, next) => validateUserRequest(req, res, next, userSchema),createLearner)


export default router

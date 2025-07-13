
import express from 'express';
import { getAllUsers, createAdmin,login } from '../controllers/userController.js';
import { validateUserRequest, userSchema, generateRtokenSchema, loginSchema, } from '../middleware/userInputValidator.js';


const router = express.Router()

router.get('/user', getAllUsers)
router.post('/user/admin', (req, res, next) => validateUserRequest(req, res, next, userSchema), createAdmin)


export default router
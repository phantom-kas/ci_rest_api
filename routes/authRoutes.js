
import express from 'express';
import { checkToken, generateAtoken, login, verifyEmail } from '../controllers/authController.js';
import { generateRtokenSchema, loginSchema, validateUserRequest } from '../middleware/userInputValidator.js';
import { authenticateAtoken } from '../middleware/auth.js';


const router = express.Router()

router.post('/generate_new_access_token', (req, res, next) => validateUserRequest(req, res, next, generateRtokenSchema), generateAtoken)
router.post('/login', (req, res, next) => validateUserRequest(req, res, next, loginSchema), login)
router.get('/check_token',authenticateAtoken, checkToken)
router.post('/verify_email',authenticateAtoken, verifyEmail)

export default router

import express from 'express';
import { checkToken, generateAtoken, generateResetPasswordToken, login, validateAndResetPassword, verifyEmail, verifyEmailToken } from '../controllers/authController.js';
import { generateRtokenSchema, loginSchema, resetPasswordSchema, validateUserRequest, verifyEmailSchema } from '../middleware/userInputValidator.js';
import { authenticateAtoken } from '../middleware/auth.js';


const router = express.Router()

router.post('/generate_new_access_token', (req, res, next) => validateUserRequest(req, res, next, generateRtokenSchema), generateAtoken)
router.post('/login', (req, res, next) => validateUserRequest(req, res, next, loginSchema), login)
router.get('/check_token',authenticateAtoken, checkToken)
router.get('/send_verify_email',authenticateAtoken, verifyEmail)
router.post('/verify_email',authenticateAtoken,(req, res, next) => validateUserRequest(req, res, next, verifyEmailSchema), verifyEmailToken)
router.get('/generate_reset_password_token', generateResetPasswordToken)
router.put('/reset_password',(req, res, next) => validateUserRequest(req, res, next, resetPasswordSchema), validateAndResetPassword)

export default router
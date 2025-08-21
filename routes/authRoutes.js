
import express from 'express';
import { changePassword, checkToken, generateAtoken, generateResetPasswordToken, login, logOut, validateAndResetPassword, verifyEmail, verifyEmailToken } from '../controllers/authController.js';
import { generateRtokenSchema,passwordSchema, loginSchema, resetPasswordSchema, validateUserRequest, verifyEmailSchema } from '../middleware/userInputValidator.js';
import { authenticateAtoken } from '../middleware/auth.js';


const router = express.Router()

router.post('/generate_new_access_token', generateAtoken)
router.post('/logout', logOut)
router.post('/login', (req, res, next) => validateUserRequest(req, res, next, loginSchema), login)
router.get('/check_token',authenticateAtoken, checkToken)
router.get('/send_verify_email',authenticateAtoken, verifyEmail)
router.put ('/change_password',(req, res, next) => validateUserRequest(req, res, next, passwordSchema),authenticateAtoken, changePassword)
router.post('/verify_email',authenticateAtoken,(req, res, next) => validateUserRequest(req, res, next, verifyEmailSchema), verifyEmailToken)
router.get('/generate_reset_password_token', generateResetPasswordToken)
router.put('/reset_password',(req, res, next) => validateUserRequest(req, res, next, resetPasswordSchema), validateAndResetPassword)

export default router
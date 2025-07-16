import { deleteRefreshToken, storeRefereshTOken, getRtoken, getUserLoginDetails, getUserForToken, storeVerificationCode, getUserToken, setUserToEmailVerified, updateUserPassword, updateLastLogin } from "../models/authModel.js";
import { generateCode, standardResponse } from "../utils/utils.js"
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken'
import { sendEmail } from "../services/emailService.js";
import { resetPasswordEmailHTML, verificationEmail } from "../emails/otp.js";
import { getUserIDByEmail } from "../models/userModel.js";

export const createAccessToken = (user, rtkn) => {
    return jwt.sign({ ...user, rtkn }, process.env.ATOKEN_SECRET, { expiresIn: 3 * 60 * 60 })
}

export const createRefereshToken = (userInfo) => {
    let refreshtoken = jwt.sign(userInfo, process.env.RTOKEN_SECRET, { expiresIn: 24 * 60 * 60 })
    let tokenId = storeRefereshTOken(refreshtoken, userInfo.id)
    return { refreshtoken, tokenId }
}

export const generateAtoken = async (req, res, next) => {
    const { refreshToken } = req.body
    if (!refreshToken) {
        standardResponse(res, 401, undefined, 'Access denied');
    }
    if (getRtoken(refreshToken).length < 1) {
        standardResponse(res, 403, undefined, 'Token not valid');
        return
    }
    jwt.verify(refreshToken, process.env.RTOKEN_SECRET, (err, user) => {
        if (err) {
            standardResponse(res, 403, undefined, err.message);
            return
        }
        let userInfo = getUserForToken(userInfo.id)
        const { refreshtoken, tokenId } = createRefereshToken(userInfo)
        const accessToken = createAccessToken(userInfo, tokenId)
        deleteRefreshToken(refreshToken)
        standardResponse(res, 200, { accessToken, refreshToken: refreshtoken })
    })
}


export const login = async (req, res, next) => {
    const { password, email } = req.body
    const user = await getUserLoginDetails(email)
    if (!user) {
        standardResponse(res, 401, undefined, 'In valid credentials');
        return
    }
    if (! await bcrypt.compare(password, user.password)) {
        return standardResponse(res, 401, undefined, 'In valid credentials');
    }
    if (!await updateLastLogin(user.id)) {
        return standardResponse(res, 500, undefined, 'Something went wrong');
    }
    let userInfo = await getUserForToken(user.id)
    if (!userInfo) {
        standardResponse(res, 401, undefined, 'In valid credentials');
        return
    }
    const { refreshtoken, tokenId } = createRefereshToken(userInfo)
    const accessToken = createAccessToken(userInfo, tokenId)
    userInfo.refreshToken = refreshtoken
    userInfo.accessToken = accessToken
    standardResponse(res, 200, userInfo, 'Login success')
    return

}



export const checkToken = async (req, res, next) => {
    standardResponse(res, 200, req.user)
}

export const verifyEmail = async (req, res, next, user = null) => {
    let email, id;
    if (user) {
        email = user.email
        id = user.id;
        console.log('user1')

        console.log(user)
    } else {
        email = req.user.email
        id = req.user.id
        console.log('user2')
    }
    if (!email) {
        standardResponse(res, 400, undefined, 'Email not provided');
        return
    }
    const code = generateCode();
    if (!await storeVerificationCode(id, code)) {
        standardResponse(res, 500, undefined, 'Error');
        return
    }
    try {
        await sendEmail(email, verificationEmail(code));
        // res.json({ message: 'Verification code sent' });
        standardResponse(res, 200, undefined, 'Verification code sent');
    } catch (err) {
        next(err)
    }
}




export const verifyEmailToken = async (req, res, next) => {
    const { token } = req.body
    if (!token) {
        standardResponse(res, 400, undefined, 'Token not provided');
        return
    }
    const storedtoken = await getUserToken(req.user.id)
    if (!storedtoken) {
        standardResponse(res, 401, undefined, 'Invalid Verification Token');
        return
    }

    if (!await bcrypt.compare(token, storedtoken)) {
        standardResponse(res, 400, undefined, 'Invalid Verification Token');
        return
    }

    if (setUserToEmailVerified(req.user.id)) {
        // Update user status to verified
        standardResponse(res, 200, undefined, 'Email verified successfully');
    } else {
        standardResponse(res, 400, undefined, 'Invalid verification code');
    }
}

export const generateResetPasswordToken = async (req, res, next) => {
    const email = req.query.email
    const id = await getUserIDByEmail(email);
   
    console.log(']]]]]]]]]]]]]]]]]]]]]]]]')
    console.log(id)
    const code = generateCode();
    if (!await storeVerificationCode(id, code)) {
        standardResponse(res, 500, undefined, 'Error');
        return
    }

    const token = jwt.sign({ id, code }, process.env.ATOKEN_SECRET, { expiresIn: 60 * 60 })
    const encoded = Buffer.from(token).toString('base64');
    let link = (req.query.link || process.env.FRONTEND_URL) + '?token=' + encoded;

    try {
        await sendEmail(email, resetPasswordEmailHTML(link),'Password Reset');
        standardResponse(res, 200, undefined, 'Reset password link sent to your email');
    } catch (err) {
        next(err)
    }
}


export const validateAndResetPassword = async (req, res, next) => {
    const { token, newPassword } = req.body;
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const decoded = jwt.verify(decodedToken, process.env.ATOKEN_SECRET);
    let { id, code } = decoded;
    console.log(']]]]]]]]]]]]]]]]]]]]]]]]')
    console.log(decoded)
    const storedtoken = await getUserToken(id)
    if (!storedtoken) {
        standardResponse(res, 401, undefined, 'Invalid Verification Token');
        return
    }

    if (!await bcrypt.compare(code, storedtoken)) {
        standardResponse(res, 400, undefined, 'Invalid Verification Token.');
        return
    }

    let salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash(newPassword, salt);

    if (await updateUserPassword(id, pwd, salt)) {
        return standardResponse(res, 200, undefined, 'Password reset successfully');
    }
    standardResponse(res, 500, undefined, 'Error resetting password');
}
import { deleteRefreshToken, storeRefereshTOken, getRtoken, getUserLoginDetails, getUserForToken, storeVerificationCode, getUserToken, setUserToEmailVerified, updateUserPassword, updateLastLogin, getRtokenByerssionID, revokeRtokens, getUSerPassword, updaePassword } from "../models/authModel.js";
import { compareTokens, generateCode, setRtokenCookie, standardResponse } from "../utils/utils.js"
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken'
import { sendEmail } from "../services/emailService.js";
import { resetPasswordEmailHTML, verificationEmail } from "../emails/otp.js";
import { getUserIDByEmail, getUserService } from "../models/userModel.js";
import { v4 as uuidv4 } from 'uuid';
export const createAccessToken = (user, rtkn) => {
    return jwt.sign({ ...user, rtkn }, process.env.ATOKEN_SECRET, { expiresIn: 60 * 60 * 3 })
    // return jwt.sign({ ...user, rtkn }, process.env.ATOKEN_SECRET, { expiresIn: 10 })
}

export const createRefereshToken = async (userInfo, ancestor = null) => {
    let uuid = uuidv4()
    let refreshtoken = jwt.sign({ ...userInfo, uuid }, process.env.RTOKEN_SECRET, { expiresIn: 24 * 60 * 60 })
    let tokenId = await storeRefereshTOken(refreshtoken, userInfo.id, ancestor, uuid)
    return { refreshtoken, tokenId }
}

export const generateAtoken = async (req, res, next) => {
    // const { refreshToken } = req.body

    console.log("-----------------rtk----------------------------------")
    console.log(req.cookies)
    const refreshToken = req.cookies.refresh_token; 

    if (!refreshToken) {
        return standardResponse(res, 401, undefined, 'Token not found');
    }

    let decoded
    try {
        decoded = jwt.verify(refreshToken, process.env.RTOKEN_SECRET)
    } catch (error) {
        standardResponse(res, 403, undefined, 'Token not valid.');
        return
    }
    const session_id = decoded.uuid
    const oldToken = await getRtokenByerssionID(session_id)

    if (oldToken.length < 1) {
        standardResponse(res, 403, undefined, 'Token not valid');
        return
    }

    if (oldToken[0]['is_revoken'] == 1) {
        standardResponse(res, 403, undefined, 'Token revoked');
        return
    }
    if (!await compareTokens(refreshToken, oldToken[0]['token'])) {
        standardResponse(res, 403, undefined, 'Token not valid.');
        return
    }


    const ancestor = oldToken[0]['ancestor'] ?? oldToken[0]['id']

    console.log('---------------------------')
    console.log('an' + oldToken[0]['ancestor'])
    console.log('old' + oldToken[0]['id'])
    console.log('tkn' + ancestor)
    console.log('---------------------------')
    let userInfo = await getUserForToken(decoded.id)
    await revokeRtokens(ancestor)
    const { refreshtoken, tokenId } = await createRefereshToken(userInfo, ancestor)
    const accessToken = createAccessToken(userInfo, tokenId)

    setRtokenCookie(res, refreshtoken)
    standardResponse(res, 200, { accessToken, refreshToken: refreshtoken })

}


export const login = async (req, res, next) => {
    const { password, email } = req.body
    console.log("--------------------------login----------------------",);

    console.log("Connecting to DB:", {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        ssl: true
    });

    console.log("--------------------------login----------------------",);
    const user = await getUserLoginDetails(email)

    console.log(user);
    if (!user) {
        standardResponse(res, 403, undefined, 'Invalid credentials');
        return
    }
    if (!user.password || !await bcrypt.compare(password, user.password)) {
        return standardResponse(res, 403, undefined, 'Invalid credentials');
    }
    if (!await updateLastLogin(user.id)) {
        return standardResponse(res, 500, undefined, 'Something went wrong');
    }
    let userInfo = await getUserService(user.id)
    userInfo = userInfo[0]
    //  console.log(userInfo)
    console.log('userid' + user.id)
    if (!userInfo) {
        standardResponse(res, 403, undefined, 'Invalid credentials');
        return
    }
    console.log(userInfo)
    const payload = { email: userInfo.email, fristName: userInfo.fristName, lastName: userInfo.lastName, role: userInfo.role, id: userInfo.id }
    const { refreshtoken, tokenId } = await createRefereshToken(payload)
    const accessToken = createAccessToken(payload, tokenId)
    userInfo.refreshToken = refreshtoken
    userInfo.accessToken = accessToken
    setRtokenCookie(res, refreshtoken)
    standardResponse(res, 200, userInfo, 'Login success', { accessToken, refreshtoken })
    return

}



export const checkToken = async (req, res, next) => {
    standardResponse(res, 200, req.user)
}

export const verifyEmail = async (req, res, next, user = null, end = true) => {
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
        end && standardResponse(res, 200, { id }, 'Verification code sent');
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
        await sendEmail(email, resetPasswordEmailHTML(link), 'Password Reset');
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



export const logOut = async (req, res, next) => {
    const  refreshToken  = req.cookies.refresh_token
    if (!refreshToken) {
        return standardResponse(res, 401, undefined, 'Access denied');
    }
    let decoded
    try {
        decoded = jwt.verify(refreshToken, process.env.RTOKEN_SECRET)
    } catch (error) {
        standardResponse(res, 403, undefined, 'Token not valid.');
        return
    }
    const session_id = decoded.uuid
    const oldToken = await getRtokenByerssionID(session_id)

    if (oldToken.length < 1) {
        standardResponse(res, 403, undefined, 'Token not valid');
        return
    }

    if (oldToken[0]['is_revoken'] == 1) {
        standardResponse(res, 403, undefined, 'Token revoked');
        return
    }
    const ancestor = oldToken[0]['ancestor'] ?? oldToken[0]['id']
    await revokeRtokens(ancestor)
    return standardResponse(res, 200, undefined, 'Logout success');
}


export const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    const password = await getUSerPassword(req.user.id)
    if (!password) {
        standardResponse(res, 401, undefined, 'Invalid credentials');
        return
    }
    if (!await bcrypt.compare(oldPassword, password)) {
        return standardResponse(res, 400, undefined, 'Invalid credentials');
    }
    let salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash(newPassword, salt);
    if (await updaePassword(req.user.id, pwd)) {
        return standardResponse(res, 200, undefined, 'Password changed successfully');
    }

    return standardResponse(res, 400, undefined, 'Password change error')
}
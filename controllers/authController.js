import { deleteRefreshToken, storeRefereshTOken, getRtoken, getUserLoginDetails, getUserForToken, storeVerificationCode } from "../models/authModel.js";
import { generateCode, standardResponse } from "../utils/utils.js"
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken'
import { sendEmail } from "../services/emailService.js";
import { verificationEmail } from "../emails/otp.js";

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
    if (await bcrypt.compare(password, user.password)) {
        let userInfo = await getUserForToken(user.id)
        if (!userInfo) {
            standardResponse(res, 401, undefined, 'In valid credentials');
        }
        const { refreshtoken, tokenId } = createRefereshToken(userInfo)
        const accessToken = createAccessToken(userInfo, tokenId)
        standardResponse(res, 200, undefined, 'Login success', undefined, { refreshtoken, accessToken })
        return
    }
    standardResponse(res, 401, undefined, 'In valid credentials');
}



export const checkToken = async (req, res, next) => {
    standardResponse(res, 200, req.user)
}

export const verifyEmail = async (req, res, next) => {
    const { email, id } = req.user
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
         
        await sendEmail(req.user.email, verificationEmail(code));
        // res.json({ message: 'Verification code sent' });
        standardResponse(res, 200, undefined, 'Verification code sent');
    } catch (err) {
        next(err)
    }

}
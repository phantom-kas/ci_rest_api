import { standardResponse } from "../utils/utils.js";
import jwt from "jsonwebtoken";


export const authenticateAtoken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return standardResponse(res, 401, undefined, 'No token provided')
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ATOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return standardResponse(res, 401, undefined, 'Invalid token')
    }
}


export const adminProjected = (req, res, next) => {
    if (req.user.role != 'admin') {
        return standardResponse(res, 401, undefined, 'Access denied');
    }
    next()
}


import { checkUserExists, createUser, getAllUsersService } from "../models/userModel.js"
import { standardResponse } from "../utils/utils.js";

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();
        standardResponse(res, 200, users)
    }
    catch (err) {
        next(err)
    }
}



export const createAdmin = async (req, res, next) => {
    const { firstName, lastName, email, password, contact } = req.body
    try {
        if (await checkUserExists({ email })) {
            return standardResponse(res, 400, undefined, 'Email taken.\nPlease choose another one');
        }
        const user = await createUser(firstName, lastName, email, password, contact, 'admin');
        standardResponse(res, 200, { id: user }, 'User created successfully.')
    }
    catch (err) {
        next(err)
    }
}


export const login = async (eq, res, next) => {
    try {
        
    } catch (err) {
        next(err)
    }
}
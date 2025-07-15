import { checkUserExists, createUser, getAllUsersService, updateUserInfo } from "../models/userModel.js"
import { standardResponse } from "../utils/utils.js";
import { verifyEmail } from "./authController.js";

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
    let created_by = null
    if (req.user != undefined) {
        created_by = req.user.id
    }
    try {
        if (await checkUserExists({ email })) {
            return standardResponse(res, 400, undefined, 'Email taken.\nPlease choose another one');
        }
        const user = await createUser(firstName, lastName, email, password, contact, 'admin', created_by);
        // standardResponse(res, 200, { id: user }, 'User created successfully.')
       return verifyEmail(req, res, next, { id:user, email })
    }
    catch (err) {
        next(err)
    }
}




export const createLearner = async (req, res, next) => {
    const { firstName, lastName, email, password, contact } = req.body
    let created_by = null
    if (req.user != undefined) {
        created_by = req.user.id
    }
    try {


        if (await checkUserExists({ email })) {
            return standardResponse(res, 400, undefined, 'Email taken.\nPlease choose another one');
        }
        const user = await createUser(firstName, lastName, email, password, contact, 'learner', created_by);
        //standardResponse(res, 200, { id: user }, 'User created successfully.')
         return verifyEmail(req, res, next, { id:user, email })
    }
    catch (err) {
        next(err)
    }
}




export const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id
        if (req.user.role != 'admin') {
            if (id != req.user.id) {
                return standardResponse(res, 401, undefined, 'Access denied');
            }
        }
        const { firstName, lastName, contact, description } = req.body
        if (await updateUserInfo(firstName, lastName, contact, description, id)) {
            return standardResponse(res, 200, undefined, 'Update successful')
        }
        return standardResponse(res, 400, undefined, 'Update failed')
    } catch (err) {
        next(err)
    }
}


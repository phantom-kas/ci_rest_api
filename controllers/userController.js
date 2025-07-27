import { editImageDb } from "../models/trackModel.js";
import { checkUserExists, createUser, deleteUserService, editImageService, getAllUsersService, getUserService, increaseAdmins, increaseLearners, updateUserImage, updateUserInfo } from "../models/userModel.js"
import { deleteFile, getPaginationDb, handleUpload, standardResponse } from "../utils/utils.js";
import { verifyEmail } from "./authController.js";

export const getAllUsers = async (req, res, next) => {
    const lastId = parseInt(req.query.lastId) || null;
    let limit = parseInt(req.query.limit) || 10;

    const tracks = await getPaginationDb(`SELECT id,firstName,lastName,email,isVerified,createdAt,__v,location,phone,image,createdAt,gender	
   from users
        `, 'id', limit, lastId);
    standardResponse(res, 200, tracks)
    return
}




export const createAdmin = async (req, res, next) => {
    const { firstName, lastName, email, password, contact, phone, location, gender, description } = req.body
    let created_by = null
    if (req.user != undefined) {
        created_by = req.user.id
    }
    try {
        if (await checkUserExists({ email })) {
            return standardResponse(res, 400, undefined, 'Email taken.\nPlease choose another one');
        }
        const user = await createUser(firstName, lastName, email, password, contact, 'admin', created_by, phone, location, gender, description);
        if (user) {
            const fileUrl = await handleUpload(req);
            await updateUserImage(user, fileUrl);
        }
        // standardResponse(res, 200, { id: user }, 'User created successfully.')
        return verifyEmail(req, res, next, { id: user, email })
    }
    catch (err) {
        next(err)
    }
}




export const createLearner = async (req, res, next) => {
    const { firstName, lastName, email, password, contact, phone, location, gender, description } = req.body
    let created_by = null
    if (req.user != undefined) {
        created_by = req.user.id
    }
    try {


        if (await checkUserExists({ email })) {
            return standardResponse(res, 400, undefined, 'Email taken.\nPlease choose another one');
        }
        const user = await createUser(firstName, lastName, email, password, contact, 'learner', created_by, phone, location, gender, description);
        if (user) {
            const fileUrl = await handleUpload(req);
            await updateUserImage(user, fileUrl);
        }
        //standardResponse(res, 200, { id: user }, 'User created successfully.')
        return verifyEmail(req, res, next, { id: user, email })
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
        const { firstName, lastName, description, phone, location, gender, } = req.body
        if (await updateUserInfo(firstName, lastName, description, phone, location, gender, id)) {
            return standardResponse(res, 200, undefined, 'Update successful')
        }
        return standardResponse(res, 400, undefined, 'Update failed')
    } catch (err) {
        next(err)
    }
}


export const getUser = async (req, res, next) => {
    const id = req.params.id
    const user = await getUserService(id)
    if (user.length < 1) {
        return standardResponse(res, 404, undefined, 'User not found')
    }
    return standardResponse(res, 200, user)
}

export const deleteUser = async (req, res, next) => {
    const id = req.params.id
    const user = await getUserService(id)
    if (user.length < 1) {
        return standardResponse(res, 404, undefined, 'User not found')
    }

    if (!await deleteUserService(id)) {
        return standardResponse(res, 500, undefined, 'UNkown error.')
    }

    console.log(user)

    await deleteFile(user[0]['image'])

    if (user[0]['role'] == 'admin') {
        await increaseAdmins(-1);
    } else {
        await increaseLearners(-1);
    }

    return standardResponse(res, 200, undefined, 'Delete success')

}



export const editImage = async (req, res, next) => {
    try {
        const id = req.params.id
        const user = await getUserService(id)
        // console.log(id)
        // console.log(track)
        await deleteFile(user[0]['image'], res);
        const fileUrl = await handleUpload(req);
        await editImageService(id, fileUrl)
        return standardResponse(res, 200, undefined, ' Update Successfull')
    }
    catch (err) {
        next(err)
    }
}
import db from "../db.js";
import { checkUserExists, createAdmin, createUser, deleteUserService, getUserService, increaseAdmins, increaseLearners, updateUserImage, updateUserInfo } from "../models/userModel.js"
import { deleteFile, getPaginationService, handleUpload, standardResponse } from "../utils/utils.js";
import { verifyEmail } from "./authController.js";

export const getAllUsers = async (req, res, next) => {
    const lastId = parseInt(req.query.lastId) || null;
    let limit = parseInt(req.query.limit) || 10;

    let where = '';
    let params = ''
    if (req.query.type) {
        where = ' and role = ? '
        if (req.query.type == 'admins')
            params = ['admin']
        else
            params = ['learner']
    }


    
          
    
        if (req.query.search != undefined) {
            where += ' and (firstName like ?  || lastName like ? || email like ? || location like ? || disability like ?)';
            params.push('%' + req.query.search + '%')
            params.push('%' + req.query.search + '%')
            params.push('%' + req.query.search + '%')
            params.push('%' + req.query.search + '%')
            params.push('%' + req.query.search + '%')
            // adssa
        }
    const tracks = await getPaginationService(`SELECT id,firstName,lastName,email,isVerified,createdAt,__v,location,phone,image,createdAt,gender	
   from users`, 'id', limit, lastId, where, params);
    standardResponse(res, 200, tracks)
    return
}


export const getAllUser2 = async (req, res, next) => {

    const [users] = await db.query(`SELECT image,id,firstName,lastName	
   from users where email != 'deleted'`);
    standardResponse(res, 200, users)
    return
}



export const registerAdmin = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body
    
    if (req.user != undefined) {
        created_by = req.user.id
    }
    try {
        if (await checkUserExists({ email })) {
            return standardResponse(res, 400, undefined, 'Email taken.\nPlease choose another one');
        }
        const user = await createAdmin(firstName, lastName, email, password);
        if (user) {
            
            return verifyEmail(req, res, next, { id: user, email })
        }
     standardResponse(res, 500, { id: user }, 'User Error.')
    }
    catch (err) {
        next(err)
    }
}




export const createLearner = async (req, res, next) => {
    const { firstName, lastName, email, password, phone, location, gender, description, disability } = req.body
    let created_by = null
    if (req.user != undefined) {
        created_by = req.user.id
    }
    try {


        if (await checkUserExists({ email })) {
            return standardResponse(res, 400, undefined, 'Email taken.\nPlease choose another one');
        }
        const user = await createUser(firstName, lastName, email, password, 'learner', created_by, phone, location, gender, description, disability);
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
        const { firstName, lastName, description, phone, location, gender, disability } = req.body
        if (await updateUserInfo(firstName, lastName, description, phone, location, gender, id, disability)) {
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

    await deleteFile(user[0]['image'],res,req)

    if (user[0]['role'] == 'admin') {
        await increaseAdmins(-1);
    } else {
        await increaseLearners(-1);
    }

    return standardResponse(res, 200, undefined, 'Delete success')

}



export const getCounts =  async (req, res, next) => {
    const [counts] =await db.query("SELECT learners_count,tracks_count from app_state LIMIT 1")

    // console.log(counts)
    return standardResponse(res, 200, counts[0], 'Delete success')
}

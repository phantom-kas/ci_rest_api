import { getUserForToken, updateLastLogin } from '../models/authModel.js';
import { getTrackService } from '../models/learnerModel.js'
import { getTrackCourses } from "../models/trackModel.js";
import { checkUserExists, createUser } from '../models/userModel.js';
import { standardResponse } from '../utils/utils.js';
import { createAccessToken, createRefereshToken, verifyEmail } from './authController.js';
export const getTrack = async (req, res, next) => {
  try {
    const user = req.user
    const { id } = req.params
    const courses = await getTrackCourses(id)
    console.log('user', user / id)
    const track = await getTrackService(id, user.id);
    return standardResponse(res, 200, { track, courses })
  }
  catch (err) {
    next(err)
  }
}



export const createLearner = async (req, res, next) => {
  const { firstName, lastName, email, password, phone, location, gender, description } = req.body
  let created_by = null
  if (req.user != undefined) {
    created_by = req.user.id
  }
  try {


    if (await checkUserExists({ email })) {
      return standardResponse(res, 400, undefined, 'Email taken.\nPlease choose another one');
    }
    const user = await createUser(firstName, lastName, email, password, 'learner', created_by, phone, location, gender, description);
    verifyEmail(req, res, next, { id: user, email }, false)
    if (!await updateLastLogin(user)) {
      return standardResponse(res, 500, undefined, 'Something went wrong');
    }
    let userInfo = await getUserForToken(user)
    if (!userInfo) {
      standardResponse(res, 401, undefined, 'Invalid credentials');
      return
    }
    const { refreshtoken, tokenId } = await createRefereshToken(userInfo)
    const accessToken = createAccessToken(userInfo, tokenId)
    userInfo.refreshToken = refreshtoken
    userInfo.accessToken = accessToken
    standardResponse(res, 200, userInfo, 'Login success')
  }
  catch (err) {
    next(err)
  }
}

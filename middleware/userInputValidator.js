import Joi from 'joi'
import { standardResponse } from '../utils/utils.js'

export const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.optional(),
    gender: Joi.optional(),
    location: Joi.optional(),
    description: Joi.optional(),
})


export const createInvoiceSchema = Joi.object({
    trackId: Joi.string().required(),
    price: Joi.optional(),
    user: Joi.string().optional(),
    price: Joi.number().optional(),
    // userId: Joi.string().required(),
})

export const generateRtokenSchema = Joi.object({
    refreshToken: Joi.string().required()
})


export const verifyEmailSchema = Joi.object({
    token: Joi.string().min(5).required()
})


export const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required()
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
})

export const updateUserInfoSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().required(),
    phone: Joi.string().required(),
    disability: Joi.string().required(),
    location: Joi.string().required(),
    gender: Joi.string().required(),
    description: Joi.string().required(),
})
export const courseSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    track: Joi.string().required(),
})


export const changePassword = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    track: Joi.string().required(),
})


export const passwordSchema = Joi.object({
    oldPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
})

export const trackSchema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    duration: Joi.string().required(),
    instructor: Joi.string().required(),
    description: Joi.string().required(),
})


export const reviewSchema = Joi.object({
    review: Joi.string(),
    rating: Joi.number().min(1).max(5).required(),
    track: Joi.string().required(),
    // us: Joi.string().required(),
})

export const validateUserRequest = (req, res, next, validationObject) => {
    const { error } = validationObject.validate(req.body)
    if (error) {
        return standardResponse(res, 400, undefined, error.details[0].message, error.details)
    }
    next()
}
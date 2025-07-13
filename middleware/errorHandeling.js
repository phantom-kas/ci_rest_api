import { standardResponse } from "../utils/utils.js"

export const errorHander = (err, req, res, next) => {
    console.log('error handeling ---------------------------------------')
    console.error(err)
    standardResponse(res, 500, undefined, 'Something went wrong. \n Please try again later.', undefined, { err: err.message })
}


import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../types/requsetObject';
import { Response } from 'express';
import user from '../models/user';

export const getAllUsers = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { start, limit } = req.query
    let starting: number = 0, limitCount: number = 5
    if (start) {
        starting = Number(start)
    }
    if (limit) {
        limitCount = Number(limit)
    }
    const allUser = await user.find({},{"password":0}).skip(starting).limit(limitCount)
    res.json({ status: true, data: allUser })
})
export const manageUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        })
        throw ('Unauthorized user')
    }
    const { user_id, isBanned } = req.query
    if (!user_id || !isBanned) {
        res.status(400).json({
            status: false,
            message: "Params missing"
        })
        throw new Error('params missing')
    }
    const User = await user.findByIdAndUpdate({ _id: user_id }, { isBanned }, { new: true })
    res.json({ status: true, data: User })
})
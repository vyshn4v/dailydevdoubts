import mongoose, { Schema } from 'mongoose';
import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../types/requsetObject';
import { Response } from 'express';
import user from '../models/user';
import BookmarkedQuestions from '../models/bookmarkedQuestions';
import AnswerRequest from '../models/answerRequest';
import Question from '../models/question';

export const getAllUsers = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { start, limit, sort, search } = req.query
    let starting: number = 0, limitCount: number = 5, sorting: { [createdAt: string]: 1 | -1 } = { createdAt: 1 }
    if (start) {
        starting = Number(start)
    }
    if (limit) {
        limitCount = Number(limit)
    }
    if (sort === "asc" || sort === "des") {
        sorting = (sort === 'asc') ? { createdAt: 1 } : { createdAt: -1 }
    } else if (sort) {
        res.status(400).json({ status: true, message: "params not matched" })
        throw new Error("params not matched")
    }
    const allUser = await user.find(req?.admin ? { name: { $regex: search ?? "", $options: "i" } } : { name: { $regex: search ?? "", $options: "i" }, isVerified: true }, { "password": 0 }).sort(sorting).skip(starting).limit(limitCount)
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
export const getProfile = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { _id: id } = req.query
    const { _id } = req.user

    if (!_id) {
        res.status(400).json({
            status: false,
            message: "Params missing"
        })
        throw new Error('params missing')
    }

    const User = await user.aggregate([
        {
            $match: {
                _id: id ? new mongoose.Types.ObjectId(String(id)) : _id
            }
        },
        {
            $lookup: {
                from: "questions",
                localField: "_id",
                foreignField: "user",
                as: "questions"
            }
        },
        {
            $lookup: {
                from: "answers",
                localField: "_id",
                foreignField: "user",
                as: "answers"
            }
        },
        {
            $lookup: {
                from: "orders",
                localField: "plan",
                foreignField: "_id",
                as: "orders",
            },
        },
        {
            $unwind: {
                path: "$orders",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "plans", // Replace with the actual collection name for plans
                let: { planId: "$orders.plan" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$planId"] },
                        },
                    },
                    {
                        $addFields: {
                            expired_date: "$orders.expired_date",
                        },
                    },
                ],
                as: "orders.plan",
            },
        },
        {
            $unwind: {
                path: "$plan",
                preserveNullAndEmptyArrays: true,
            },
        },
        // {
        //     $group: {
        //         _id: "$_id",
        //         questions: { $first: "$questions" },
        //         answers: { $first: "$answers" },
        //         plan: { $push: "$plan" },
        //     },
        // }
    ])
    const editAnswerRequests = await AnswerRequest.find({ user: _id, isApprove: false }).populate('edited_by', '-password')
    const followers = await user.find({ following_user: { $in: [_id] } })
    const bookmark = await BookmarkedQuestions.findById(_id).populate("Bookmarks", '-password')
    res.json({ status: true, data: { ...User[0], followers, bookmark, editAnswerRequests } })
})
export const uploadImage = asyncHandler(async (req: CustomRequest, res: Response) => {
    let path = req.file?.path
    const { _id } = req.user
    if (!_id || !path) {
        res.status(400).json({ status: false, message: "params missing" })
    }
    await user.findByIdAndUpdate(_id, { profile_image: path })
    res.json({ status: true, data: path })
})

export const followUnfollowUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { user_id, follow } = req.query
    const { _id } = req.user
    if (!user_id || !_id) {
        res.status(400).json({ status: false, message: "params missing" })
    }
    console.log('follow', follow);

    const query = follow ? { $addToSet: { following_user: new mongoose.Types.ObjectId(String(user_id)) } } : { $pull: { following_user: new mongoose.Types.ObjectId(String(user_id)) } }
    const User = await user.findByIdAndUpdate(_id, query, { new: true })
    res.json({ status: true, data: User })
})
export const getFollowedUsers = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { _id } = req.user
    if (!_id) {
        res.status(400).json({ status: false, message: "params missing" })
    }
    const Users = await user.findById(_id).populate('following_user')
    res.json({ status: true, data: Users?.following_user })
})
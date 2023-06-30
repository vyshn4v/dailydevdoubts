import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../types/requsetObject';
import { Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import Question from '../models/question';
import mongoose, { Schema, SortOrder } from 'mongoose';
import user from '../models/user';
import { Types } from 'mongoose';
import { User } from '../types/user';
export const AddQuestion = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { title, html, tags, user_id } = req.body
    if (!title || !html || !tags.length || !user_id) {
        res.status(400).json({ status: false, message: "params missing" })
    }
    const sanitizedHtml = sanitizeHtml(String(html).replace(/\"/g, "'"))
    const question = new Question({
        user_id,
        title,
        body: sanitizedHtml,
        tags
    })
    question.save()
    res.json({ status: true, data: question })
})
export const getAllQuestion = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { start, limit, sort } = req.query
    let
        starting: number = 0,
        limitDataTo: number = 5,
        sorting: { [createdAt: string]: 1 | -1 } = { createdAt: 1 }
    if (start) {
        starting = Number(start)
    }
    if (limit) {
        limitDataTo = Number(limit)
    }
    if (sort === "asc" || sort === "des") {
        sorting = sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 }
    } else if (sort) {
        res.status(400).json({ status: true, message: "params not matched" })
        throw new Error("params not matched")
    }
    const allQuestions = await Question.find(req?.admin ? {} : { isApprove: true }).sort(sorting).skip(starting).limit(limitDataTo).populate('user', "-password")
    res.json({ status: true, data: allQuestions })
})
export const getQuestion = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { question_id } = req.query
    let searchParams: { _id: mongoose.Types.ObjectId } | null = null
    if (question_id) {
        searchParams = { _id: new mongoose.Types.ObjectId(String(question_id)) }
        const questionExisted = await Question.findByIdAndUpdate(searchParams, { $inc: { views: 1 } })
        if (!questionExisted) {
            res.status(404).json({ status: false, message: "question not found" })
        }
    } else {
        res.status(400).json({ status: true, message: "params missing" })
        throw new Error("params missing")
    }
    const allQuestions = await Question.aggregate([{ $match: searchParams }, {
        $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user"
        }
    }])
    res.json({ status: true, data: allQuestions[0] })
})
export const approveQuestion = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { id, isApprove } = req.query
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        })
        throw ('Unauthorized user')
    }
    if (!id || !isApprove) {
        return res.status(400).json({ status: false, message: "Params missing" })
    }
    const allQuestions = await Question.findOneAndUpdate({ _id: id }, { isApprove }, { new: true }).populate('user')
    res.json({ status: true, data: allQuestions })
})
export const voteQuestion = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { question_id, upvote } = req.query
    const { _id } = req.user
    logger.info(`user ${_id} is trying to vote question ${question_id}`)
    if (!question_id || !_id) {
        return res.status(400).json({ status: false, message: "Params missing" })
        throw new Error("Params missing")
    }
    const questioExisted = await Question.findById(question_id)
    if (_id?.toString() == questioExisted?._id.toString()) {
        res.status(405).json({ status: false, message: 'you cant vote your own questions' })
        throw new Error(`user ${_id} trying to vote own question ${question_id}`)
    }
    const update = Boolean(upvote)
        ? {
            $addToSet: { up_vote: _id },
            $pull: { down_vote: _id }
        }
        : {
            $addToSet: { down_vote: _id },
            $pull: { up_vote: _id }
        };
    let updatedQuestion = await Question.findByIdAndUpdate(question_id, update, { new: true })
    let User = await user.findById(updatedQuestion?.user)
    await updatedQuestion?.populate('user', "-password")
    if (User && !updatedQuestion?.up_vote.includes(_id) && !updatedQuestion?.down_vote.includes(_id)) {
        console.log(User);
        User.reputation = User.reputation + 5;
        await User.save();
    }
    res.json({ status: true, data: updatedQuestion })
})
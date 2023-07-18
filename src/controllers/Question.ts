import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../types/requsetObject';
import { Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import Question from '../models/question';
import mongoose, { Schema, SortOrder } from 'mongoose';
import user from '../models/user';
import { Types } from 'mongoose';
import { User } from '../types/user';
import reportedQuestions from '../models/reportedQuestions';
import BookmarkedQuestions from '../models/bookmarkedQuestions';
export const AddQuestion = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { title, html, tags } = req.body
    const { _id } = req.user
    if (!title || !html || !tags.length || !_id) {
        res.status(400).json({ status: false, message: "params missing" })
        throw new Error('params missing ')
    }
    const sanitizedHtml = sanitizeHtml(String(html).replace(/\"/g, "'"))
    const question = new Question({
        user: _id,
        title,
        body: sanitizedHtml,
        tags
    })
    await question.save()
    res.json({ status: true, data: question })
})
export const getAllQuestion = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { start, limit, sort, search } = req.query
    let
        starting: number = 0,
        limitDataTo: number = 5,
        sorting: { [createdAt: string]: 1 | -1 } = { createdAt: -1 }, searchQuery: string
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


    const allQuestions = await Question.find(req?.admin ? { title: { $regex: search ?? "", $options: "i" } } : { isApprove: true, title: { $regex: search ?? "", $options: "i" } }).sort(sorting).skip(starting).limit(limitDataTo).populate('user', "-password").populate('answers')
    res.json({ status: true, data: allQuestions })
})
export const getQuestion = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { question_id } = req.query

    let searchParams: { _id: mongoose.Types.ObjectId, isApprove: boolean } | null = null
    if (question_id) {
        searchParams = { _id: new mongoose.Types.ObjectId(String(question_id)), isApprove: true }
        const questionExisted = await Question.findByIdAndUpdate(searchParams, { $inc: { views: 1 } })
        if (!questionExisted) {
            res.status(404).json({ status: false, message: "question not found" })
            throw new Error('question not found')
        }
    } else {
        res.status(400).json({ status: true, message: "params missing" })
        throw new Error("params missing")
    }

    let allQuestions = await Question.aggregate([
        {
            $match: searchParams
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $lookup: {
                from: "answers",
                localField: "_id",
                foreignField: "question",
                as: "answers"
            }
        },
        {
            $unwind: {
                path: "$answers",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "answers.user",
                foreignField: "_id",
                as: "answers.user"
            }
        },
        {
            $group: {
                _id: "$_id",
                question: { $first: "$$ROOT" },
                answers: { $push: "$answers" }
            }
        },
        {
            $project: {
                "question.user": 1,
                "question.title": 1,
                "question.body": 1,
                "question.tags": 1,
                "question.views": 1,
                "question.isApprove": 1,
                "question.up_vote": 1,
                "question.down_vote": 1,
                "question.createdAt": 1,
                "question.updatedAt": 1,
                "answers": {
                    $filter: {
                        input: "$answers",
                        as: "answer",
                        cond: { $ne: ["$$answer.user", []] }
                    }
                }
            }
        }
    ])
    const editedByUserIds = allQuestions.flatMap(question => question.answers?.filter((answer: { editedBy: any; }) => answer.editedBy).map((answer: { editedBy: any }) => answer.editedBy._id));
    const editedByUsers = await user.find({ _id: { $in: editedByUserIds } });

console.log(editedByUsers);

    const populatedQuestions = allQuestions.map(question => {
        const answers=question.answers?.map((answer: { editedBy: Types.ObjectId | (mongoose.Document<unknown, {}, User> & Omit<User & Required<{ _id: Types.ObjectId; }>, never>) | undefined; }) => {

            if (answer?.editedBy) {
                let editedUser = editedByUsers.find(user => user._id?.toString() === answer?.editedBy?.toString());
                console.log(editedUser);
                let result={
                    ...answer,
                    editedUser
                }
                return result
            }else{
                return answer
            }
        });
        return {...question,answers}
    });
    // populatedQuestions[0]?.answers?.sort((a: { up_vote: string | any[]; down_vote: string | any[]; }, b: { up_vote: string | any[]; down_vote: string | any[]; }) => {
    //     const aScore = a.up_vote.length - a.down_vote.length;
    //     const bScore = b.up_vote.length - b.down_vote.length;

    //     return bScore - aScore;
    // });


    res.json({ status: true, data: populatedQuestions })
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
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error("Params missing")
    }
    const questioExisted = await Question.findById(question_id)
    if (!questioExisted) {
        res.status(404).json({ status: false, message: "invalid answer id cant find answer" })
        throw new Error(`user ${_id} try to up vote using an invalid question id ${question_id}`)
    }
    if (_id?.toString() == questioExisted?.user.toString()) {
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
    if (User) {
        if (!questioExisted?.up_vote.includes(_id) && upvote) {
            User.reputation = User.reputation + 5
        }
        if (!questioExisted?.down_vote.includes(_id) && !upvote) {
            User.reputation = User.reputation - 5
        }
        await User.save();
    }
    logger.info(`user ${_id} is successfully ${Boolean(upvote) ? "up vote" : "down vote"} question ${question_id}`)
    res.json({ status: true, data: updatedQuestion })
})
export const reportQuestion = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { question_id, reason } = req.body
    const { _id } = req.user
    if (!question_id || !reason || !_id) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error("Params missing")
    }
    const alreadyReported = await reportedQuestions.find({ user: new mongoose.Types.ObjectId(_id), question: new mongoose.Types.ObjectId(question_id) })
    if (alreadyReported.length) {
        res.status(409).json({ status: false, message: "Question already reported" })
        throw new Error("Question already reported")
    }
    const newReport = new reportedQuestions({
        question: question_id,
        user: _id,
        reason
    })
    newReport.save()
    res.json({ status: true, data: newReport })
})
export const getReportedQuestion = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { start, limit, sort, search } = req.query
    if (!req.admin) {
        res.status(401).json({
            status: false,
            message: "Unauthrized user"
        })
        throw ('Unauthorized user')
    }
    let
        starting: number = 0,
        limitDataTo: number = 5,
        sorting: { [createdAt: string]: 1 | -1 } = { createdAt: -1 }, searchQuery: string
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
    const allQuestions = await reportedQuestions.find(search ? { question: new mongoose.Types.ObjectId(String(search)) } : {}).sort(sorting).skip(starting).limit(limitDataTo).populate('user', "-password").populate('question').populate('question.user')
    res.json({ status: true, data: allQuestions })
})
export const bookmarkQuestion = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { question_id, isAdd } = req.query
    const { _id } = req.user
    if (!question_id || !_id) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error(`Params missing while user ${_id} try to add question to bookmark`)
    }
    const questionExisted = await Question.findById(question_id)
    if (!questionExisted) {
        res.status(404).json({ status: false, message: "question not found" })
        throw new Error(`user ${_id} is try ing to update question ${question_id} to bookmark that not exist in database`)
    }
    if (isAdd) {
        const alreadyExist = await BookmarkedQuestions.findOne({ user: new mongoose.Types.ObjectId(_id), Bookmarks: new mongoose.Types.ObjectId(String(question_id)) })
        if (alreadyExist) {
            res.status(409).json({ status: false, message: "Already added" })
            throw new Error(`user ${_id} is try ing to update already exist question ${question_id} to bookmark`)
        }
    }
    const update = isAdd ? { $addToSet: { Bookmarks: question_id } } : { $pull: { Bookmarks: question_id } }
    const bookMark = await BookmarkedQuestions.findOneAndUpdate({ user: new mongoose.Types.ObjectId(_id) }, update, { upsert: true, returnOriginal: false }).populate('Bookmarks')
    res.json({ status: true, data: bookMark })
})

export const getBookmarkedQuestions = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { _id } = req.user
    const bookmarks = await BookmarkedQuestions.findOne({ user: new mongoose.Types.ObjectId(_id) }).populate('Bookmarks')
    res.json({ status: true, data: bookmarks })
})
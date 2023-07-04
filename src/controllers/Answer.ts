import sanitizeHtml from 'sanitize-html';
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Answer from "../models/answer";
import Question from '../models/question';
import mongoose from 'mongoose';
import { CustomRequest } from '../types/requsetObject';
import user from '../models/user';
import AnswerRequest from '../models/answerRequest';

export const answerQuestion = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { question_id, html } = req.body

    const { _id } = req.user
    console.log(html, question_id, _id);
    if (!question_id || !_id || !html) {
        res.status(400).json({ status: false, message: "params missing" })
        throw new Error('params missing')
    }
    const userAlredyExist = await Answer.findOne({ question: new mongoose.Types.ObjectId(question_id), user: new mongoose.Types.ObjectId(_id) }).count()
    if (userAlredyExist) {
        res.status(409).json({ status: false, message: "already answered to question" })
        throw new Error(`user ${_id} already answered to question ${question_id}`)
    }
    const sanitizedHtml = sanitizeHtml(String(html).replace(/\"/g, "'"))
    let answer: any = new Answer({
        question: question_id,
        user: _id,
        body: sanitizedHtml
    })
    answer.save()
    const User = await user.findById(_id)
    await Question.findByIdAndUpdate(question_id, { $addToSet: { answers: answer._id } })
    res.json({ status: true, data: { ...answer._doc, user: [User] } })
})

export const voteAnswer = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { answer_id, upvote } = req.query
    const { _id } = req.user
    logger.info(`user ${_id} is trying to vote answer ${answer_id}`)
    if (!answer_id || !_id) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error("Params missing")
    }
    const answeExisted = await Answer.findById(answer_id)
    if (!answeExisted) {
        res.status(404).json({ status: false, message: "invalid answer id cant find answer" })
        throw new Error(`user ${_id} try to up vote using an invalid answer id ${answer_id}`)
    }
    if (_id?.toString() == answeExisted?.user?.toString()) {
        res.status(405).json({ status: false, message: 'you cant vote your own answer' })
        throw new Error(`user ${_id} trying to vote own answer ${answer_id}`)
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
    let updatedAnswer = await Answer.findByIdAndUpdate(answer_id, update, { new: true })
    let User = await user.findById(updatedAnswer?.user)
    if (User) {
        console.log(User);
        if (!answeExisted?.up_vote.includes(_id) && upvote) {
            User.reputation = User.reputation + 15;
        }
        if (!answeExisted?.down_vote.includes(_id) && !upvote) {
            User.reputation = User.reputation - 15;
        }
        await User.save();
    }
    let output
    if (updatedAnswer) {
        output = { ...updatedAnswer.toObject(), user: [User] }
    }
    logger.info(`user ${_id} is successfully ${Boolean(upvote) ? "up vote" : "down vote"} answer ${answer_id}`)
    res.json({ status: true, data: output })
})
export const editAnswer = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { answer_id, html } = req.body
    const { _id } = req.user
    logger.info(`user ${_id} is trying to edit answer ${answer_id}`)
    if (!answer_id || !_id) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error("Params missing")
    }
    const answerExisted = await Answer.findById(answer_id)
    if (!answerExisted) {
        res.status(404).json({ status: false, message: "invalid answer id cant find answer" })
        throw new Error(`user ${_id} try to edit answer using an invalid answer id ${answer_id}`)
    }
    if (_id?.toString() !== answerExisted?.user?.toString()) {
        res.status(405).json({ status: false, message: 'you can only edit your own answer' })
        throw new Error(`user ${_id} trying to edit others answer ${answer_id}`)
    }
    const sanitizedHtml = sanitizeHtml(String(html).replace(/\"/g, "'"))
    const update = { body: sanitizedHtml }
    let updatedAnswer = await Answer.findByIdAndUpdate(answer_id, update, { new: true })
    logger.info(`user ${_id} is successfully edit answer ${answer_id}`)
    res.json({ status: true, data: updatedAnswer })
})
export const editRequest = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { answer_id, html } = req.body
    const { _id } = req.user
    logger.info(`user ${_id} is trying to edit answer ${answer_id}`)
    if (!answer_id || !_id || !html) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error("Params missing")
    }
    const answer = await Answer.findById(answer_id)
    if (!answer) {
        res.status(409).json({ status: false, message: "no answer exist for this answer id" })
        throw new Error(`user ${_id} already try to request invalid  answer ${answer_id}`)
    }
    const user = await Answer.findOne({ _id: answer_id, user: _id }).count()
    if (user) {
        res.status(409).json({ status: false, message: "you can't edit your own answer" })
        throw new Error("you can't edit your own answer")
    }
    const answerExisted = await AnswerRequest.findOne({ answer: answer_id, user: _id })
    if (answerExisted) {
        res.status(409).json({ status: false, message: "already request to edit this answer" })
        throw new Error(`user ${_id} already request to edit this  answer ${answer_id}`)
    }

    const sanitizedHtml = sanitizeHtml(String(html).replace(/\"/g, "'"))
    let newRequest = new AnswerRequest({
        answer: answer_id,
        user: answer?.user,
        edited_by: _id,
        body: sanitizedHtml,
    })
    await newRequest.save()
    logger.info(`user ${_id} is successfully sent edit answer request for answer ${answer_id}`)
    res.json({ status: true, data: newRequest })
})
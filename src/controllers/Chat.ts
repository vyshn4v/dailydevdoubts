import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../types/requsetObject';
import { Response } from 'express';
import Chat from '../models/chats';
import Message from '../models/messages';
export const createChat = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { isGroup, name } = req.body
    const users = JSON.parse(req.body.users)
    console.log(req.body);

    const { _id } = req.user

    if (!users?.length) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error(`Params missing while user ${_id} try to add question to bookmark`)
    }
    if (isGroup && !name) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error(`Params missing is while user ${_id} is try to add question to bookmark`)
    }
    if (isGroup=='undefined') {
        console.log(users);
        const users_id=users.map((user:any)=>user.user)
        const existingChat = await Chat.exists({
            isGroupChat: false,
            'users.user': { $all: [...users_id,  _id ] },
        });

        if (existingChat) {
            res.status(400).json({ status: false, message: "Chat already exists" });
            throw new Error(`Chat already exists for the given users`);
        }
    }

    const newChat = isGroup === 'true' ?
        new Chat({
            isGroupChat: true,
            createdBy: _id,
            users: [...users, { user: _id, role: 'admin' }],
            name: name
        }) :
        new Chat({
            users: [...users, { user: _id }],
        })
    if (req?.file?.path) {
        newChat.profile_image = String(req?.file?.path)
    }
    await (await (await newChat.save()).populate('createdBy', '-password')).populate('users.user', '-password')
    res.json({ status: true, data: newChat })
})

export const sendMessage = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { message } = req.body
    const { chat_id } = req.params
    const { _id } = req.user
    if (!chat_id || !message) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error(`Params missing while user ${_id} try to add question to bookmark`)
    }
    const chatExisted = await Chat.findById(chat_id)
    if (!chatExisted) {
        res.status(400).json({ status: false, message: "Chat is not found for this chat id" })
        throw new Error(`user ${_id} try to add messages for chat that not present in db chat id: ${chat_id}`)
    }
    const chat = new Message({
        user: _id,
        message
    })
    await (await chat.save()).populate('user')
    await Chat.findByIdAndUpdate(chat_id, { $addToSet: { messages: chat._id } })
    res.json({ status: true, data: chat })
})

export const getAllChats = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { _id } = req.user
    const chats = await Chat.find({
        $or: [
            { createdBy: _id },
            { 'users.user': _id }
        ]
    })
        .populate('createdBy', '-password')
        .populate('users.user', '-password')
        .populate({
            path: 'messages',
            populate: {
                path: 'user',
                model: 'users',
            },
        }).sort({ updatedAt: -1 })
    res.json({ status: true, data: chats })

})

export const deleteGroup = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const { chat_id } = req.params
    const { left } = req.query
    const { _id } = req.user
    if (!chat_id) {
        res.status(400).json({ status: false, message: "Params missing" })
        throw new Error(`Params missing while user ${_id} try to left from group`)
    }
    const chatExist = await Chat.findById({ _id: new mongoose.Types.ObjectId(chat_id) })
    const isAdmin = chatExist?.users?.find((user) => user?.user?.toString() === _id?.toString())
    if (!chatExist) {
        res.status(404).json({ status: false, message: 'no chat found for this id' })
        throw new Error(`user trying to delete chat using bad chat id`)
    }
    if (left) {
        const userExit = await Chat.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(chat_id) }, { $pull: { users: { user: _id } } }, { new: true }).populate('users.user', '-password')
        res.json({ status: true, data: userExit })
    } else {

        if (!chatExist?.isGroupChat) {
            await Chat.findByIdAndDelete(chat_id)
            return res.json({ status: true, data: chatExist })
        }
        if (chatExist?.isGroupChat && isAdmin?.role === 'admin') {
            await Chat.findByIdAndDelete(chat_id)
            res.json({ status: true, data: chatExist })
        } else {
            res.status(401).json({ status: false, message: "unauthorized user" })
            throw new Error(`unauthorized user trying to delete group`)
        }

    }



})
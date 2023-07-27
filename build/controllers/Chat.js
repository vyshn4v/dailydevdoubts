"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGroup = exports.getAllChats = exports.sendMessage = exports.createChat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const chats_1 = __importDefault(require("../models/chats"));
const messages_1 = __importDefault(require("../models/messages"));
exports.createChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { isGroup, name } = req.body;
    const users = JSON.parse(req.body.users);
    console.log(req.body);
    const { _id } = req.user;
    if (!(users === null || users === void 0 ? void 0 : users.length)) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error(`Params missing while user ${_id} try to add question to bookmark`);
    }
    if (isGroup && !name) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error(`Params missing is while user ${_id} is try to add question to bookmark`);
    }
    if (isGroup == 'undefined') {
        console.log(users);
        const users_id = users.map((user) => user.user);
        const existingChat = yield chats_1.default.exists({
            isGroupChat: false,
            'users.user': { $all: [...users_id, _id] },
        });
        if (existingChat) {
            res.status(400).json({ status: false, message: "Chat already exists" });
            throw new Error(`Chat already exists for the given users`);
        }
    }
    const newChat = isGroup === 'true' ?
        new chats_1.default({
            isGroupChat: true,
            createdBy: _id,
            users: [...users, { user: _id, role: 'admin' }],
            name: name
        }) :
        new chats_1.default({
            users: [...users, { user: _id }],
        });
    if ((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.path) {
        newChat.profile_image = String((_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.path);
    }
    yield (yield (yield newChat.save()).populate('createdBy', '-password')).populate('users.user', '-password');
    res.json({ status: true, data: newChat });
}));
exports.sendMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    const { chat_id } = req.params;
    const { _id } = req.user;
    if (!chat_id || !message) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error(`Params missing while user ${_id} try to add question to bookmark`);
    }
    const chatExisted = yield chats_1.default.findById(chat_id);
    if (!chatExisted) {
        res.status(400).json({ status: false, message: "Chat is not found for this chat id" });
        throw new Error(`user ${_id} try to add messages for chat that not present in db chat id: ${chat_id}`);
    }
    const chat = new messages_1.default({
        user: _id,
        message
    });
    yield (yield chat.save()).populate('user');
    yield chats_1.default.findByIdAndUpdate(chat_id, { $addToSet: { messages: chat._id } });
    res.json({ status: true, data: chat });
}));
exports.getAllChats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const chats = yield chats_1.default.find({
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
    }).sort({ updatedAt: -1 });
    res.json({ status: true, data: chats });
}));
exports.deleteGroup = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { chat_id } = req.params;
    const { left } = req.query;
    const { _id } = req.user;
    if (!chat_id) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error(`Params missing while user ${_id} try to left from group`);
    }
    const chatExist = yield chats_1.default.findById({ _id: new mongoose_1.default.Types.ObjectId(chat_id) });
    const isAdmin = (_c = chatExist === null || chatExist === void 0 ? void 0 : chatExist.users) === null || _c === void 0 ? void 0 : _c.find((user) => { var _a; return ((_a = user === null || user === void 0 ? void 0 : user.user) === null || _a === void 0 ? void 0 : _a.toString()) === (_id === null || _id === void 0 ? void 0 : _id.toString()); });
    if (!chatExist) {
        res.status(404).json({ status: false, message: 'no chat found for this id' });
        throw new Error(`user trying to delete chat using bad chat id`);
    }
    if (left) {
        const userExit = yield chats_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(chat_id) }, { $pull: { users: { user: _id } } }, { new: true }).populate('users.user', '-password');
        res.json({ status: true, data: userExit });
    }
    else {
        if (!(chatExist === null || chatExist === void 0 ? void 0 : chatExist.isGroupChat)) {
            yield chats_1.default.findByIdAndDelete(chat_id);
            return res.json({ status: true, data: chatExist });
        }
        if ((chatExist === null || chatExist === void 0 ? void 0 : chatExist.isGroupChat) && (isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.role) === 'admin') {
            yield chats_1.default.findByIdAndDelete(chat_id);
            res.json({ status: true, data: chatExist });
        }
        else {
            res.status(401).json({ status: false, message: "unauthorized user" });
            throw new Error(`unauthorized user trying to delete group`);
        }
    }
}));

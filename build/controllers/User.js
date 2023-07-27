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
exports.followUnfollowUser = exports.uploadImage = exports.getProfile = exports.manageUser = exports.getAllUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_1 = __importDefault(require("../models/user"));
const bookmarkedQuestions_1 = __importDefault(require("../models/bookmarkedQuestions"));
const answerRequest_1 = __importDefault(require("../models/answerRequest"));
exports.getAllUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { start, limit, sort, search } = req.query;
    let starting = 0, limitCount = 5, sorting = { createdAt: 1 };
    if (start) {
        starting = Number(start);
    }
    if (limit) {
        limitCount = Number(limit);
    }
    if (sort === "asc" || sort === "des") {
        sorting = (sort === 'asc') ? { createdAt: 1 } : { createdAt: -1 };
    }
    else if (sort) {
        res.status(400).json({ status: true, message: "params not matched" });
        throw new Error("params not matched");
    }
    const allUser = yield user_1.default.find((req === null || req === void 0 ? void 0 : req.admin) ? { name: { $regex: search !== null && search !== void 0 ? search : "", $options: "i" } } : { name: { $regex: search !== null && search !== void 0 ? search : "", $options: "i" }, isVerified: true }, { "password": 0 }).sort(sorting).skip(starting).limit(limitCount);
    res.json({ status: true, data: allUser });
}));
exports.manageUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        });
        throw ('Unauthorized user');
    }
    const { user_id, isBanned } = req.query;
    if (!user_id || !isBanned) {
        res.status(400).json({
            status: false,
            message: "Params missing"
        });
        throw new Error('params missing');
    }
    const User = yield user_1.default.findByIdAndUpdate({ _id: user_id }, { isBanned }, { new: true });
    res.json({ status: true, data: User });
}));
exports.getProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id: id } = req.query;
    const { _id } = req.user;
    if (!_id) {
        res.status(400).json({
            status: false,
            message: "Params missing"
        });
        throw new Error('params missing');
    }
    const User = yield user_1.default.aggregate([
        {
            $match: {
                _id: id ? new mongoose_1.default.Types.ObjectId(String(id)) : _id
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
    ]);
    const editAnswerRequests = yield answerRequest_1.default.find({ user: _id, isApprove: false }).populate('edited_by', '-password');
    const followers = yield user_1.default.find({ following_user: { $in: [_id] } });
    const bookmark = yield bookmarkedQuestions_1.default.findById(_id).populate("Bookmarks", '-password');
    res.json({ status: true, data: Object.assign(Object.assign({}, User[0]), { followers, bookmark, editAnswerRequests }) });
}));
exports.uploadImage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let path = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    const { _id } = req.user;
    if (!_id || !path) {
        res.status(400).json({ status: false, message: "params missing" });
    }
    yield user_1.default.findByIdAndUpdate(_id, { profile_image: path });
    res.json({ status: true, data: path });
}));
exports.followUnfollowUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, follow } = req.query;
    const { _id } = req.user;
    if (!user_id || !_id) {
        res.status(400).json({ status: false, message: "params missing" });
    }
    const query = follow ? { $addToSet: { following_user: user_id } } : { $pull: { following_user: user_id } };
    const User = yield user_1.default.findByIdAndUpdate(_id, query, { new: true });
    res.json({ status: true, data: User });
}));

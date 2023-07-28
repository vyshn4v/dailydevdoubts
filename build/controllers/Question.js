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
exports.getBookmarkedQuestions = exports.bookmarkQuestion = exports.getReportedQuestion = exports.reportQuestion = exports.voteQuestion = exports.approveQuestion = exports.getQuestion = exports.getAllQuestion = exports.AddQuestion = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const question_1 = __importDefault(require("../models/question"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const reportedQuestions_1 = __importDefault(require("../models/reportedQuestions"));
const bookmarkedQuestions_1 = __importDefault(require("../models/bookmarkedQuestions"));
const getDailyActivity_1 = require("../helpers/getDailyActivity");
const socket_1 = require("../helpers/socket");
const NOTIFICATION = "notification";
exports.AddQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, html, tags } = req.body;
    const { _id, plan } = req.user;
    const dailyActivity = yield (0, getDailyActivity_1.getDailyactivity)(_id);
    console.log('plan', plan);
    console.log('dailyActivity', dailyActivity);
    if (!title || !html || !tags.length || !_id) {
        res.status(400).json({ status: false, message: "params missing" });
        throw new Error('params missing ');
    }
    if (!plan && dailyActivity.totalQuestions >= 1) {
        res.status(400).json({ status: false, message: "Please upgrade your plan" });
        throw new Error('Please upgrade your plan');
    }
    if (plan && new Date(plan.expired_date) < new Date()) {
        res.status(400).json({ status: false, message: "Plan expired please update plan" });
        throw new Error('Plan expired please update plan');
    }
    if (plan && dailyActivity.totalQuestions >= plan.plan.totalQuestions) {
        res.status(400).json({ status: false, message: "Daily Quota limit exceeded please add question tommorow or upgrade plan" });
        throw new Error('Daily Quota limit exceeded');
    }
    const sanitizedHtml = (0, sanitize_html_1.default)(String(html).replace(/\"/g, "'"));
    const question = new question_1.default({
        user: _id,
        title,
        body: sanitizedHtml,
        tags
    });
    yield question.save();
    yield (0, getDailyActivity_1.updateDailyQuestionLimit)(dailyActivity._id);
    res.json({ status: true, data: question });
}));
exports.getAllQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { start, limit, sort, search } = req.query;
    let starting = 0, limitDataTo = 5, sorting = { createdAt: -1 }, searchQuery;
    if (start) {
        starting = Number(start);
    }
    if (limit) {
        limitDataTo = Number(limit);
    }
    if (sort === "asc" || sort === "des") {
        sorting = sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 };
    }
    else if (sort) {
        res.status(400).json({ status: true, message: "params not matched" });
        throw new Error("params not matched");
    }
    const allQuestions = yield question_1.default.find((req === null || req === void 0 ? void 0 : req.admin) ? { $or: [
            { title: { $regex: search !== null && search !== void 0 ? search : "", $options: "i" } },
            { tags: { $regex: search !== null && search !== void 0 ? search : "", $options: "i" } },
        ], } : { isApprove: true, $or: [
            { title: { $regex: search !== null && search !== void 0 ? search : "", $options: "i" } },
            { tags: { $regex: search !== null && search !== void 0 ? search : "", $options: "i" } },
        ], }).sort(sorting).skip(starting).limit(limitDataTo).populate('user', "-password").populate('answers');
    res.json({ status: true, data: allQuestions });
}));
exports.getQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question_id } = req.query;
    let searchParams = null;
    if (question_id) {
        searchParams = { _id: new mongoose_1.default.Types.ObjectId(String(question_id)) };
        const questionExisted = yield question_1.default.findByIdAndUpdate(searchParams, { $inc: { views: 1 } });
        if (!questionExisted) {
            res.status(404).json({ status: false, message: "question not found" });
            throw new Error('question not found');
        }
    }
    else {
        res.status(400).json({ status: true, message: "params missing" });
        throw new Error("params missing");
    }
    let allQuestions = yield question_1.default.aggregate([
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
    ]);
    const editedByUserIds = allQuestions.flatMap(question => { var _a; return (_a = question.answers) === null || _a === void 0 ? void 0 : _a.filter((answer) => answer.editedBy).map((answer) => answer.editedBy._id); });
    const editedByUsers = yield user_1.default.find({ _id: { $in: editedByUserIds } });
    console.log(editedByUsers);
    const populatedQuestions = allQuestions.map(question => {
        var _a;
        const answers = (_a = question.answers) === null || _a === void 0 ? void 0 : _a.map((answer) => {
            if (answer === null || answer === void 0 ? void 0 : answer.editedBy) {
                let editedUser = editedByUsers.find(user => { var _a, _b; return ((_a = user._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = answer === null || answer === void 0 ? void 0 : answer.editedBy) === null || _b === void 0 ? void 0 : _b.toString()); });
                console.log(editedUser);
                let result = Object.assign(Object.assign({}, answer), { editedUser });
                return result;
            }
            else {
                return answer;
            }
        });
        return Object.assign(Object.assign({}, question), { answers });
    });
    // populatedQuestions[0]?.answers?.sort((a: { up_vote: string | any[]; down_vote: string | any[]; }, b: { up_vote: string | any[]; down_vote: string | any[]; }) => {
    //     const aScore = a.up_vote.length - a.down_vote.length;
    //     const bScore = b.up_vote.length - b.down_vote.length;
    //     return bScore - aScore;
    // });
    res.json({ status: true, data: populatedQuestions });
}));
exports.approveQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, isApprove } = req.query;
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        });
        throw ('Unauthorized user');
    }
    if (!id || !isApprove) {
        return res.status(400).json({ status: false, message: "Params missing" });
    }
    const allQuestions = yield question_1.default.findOneAndUpdate({ _id: id }, { isApprove }, { new: true }).populate('user');
    // let socketInstance=getSocketIO()
    // socketInstance?.to(String(allQuestions?.user?._id)).emit(NOTIFICATION, {message:`Your question is ${Boolean(isApprove) ? "approved" : "rejected"} your question`});
    res.json({ status: true, data: allQuestions });
}));
exports.voteQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question_id, upvote } = req.query;
    const { _id } = req.user;
    logger.info(`user ${_id} is trying to vote question ${question_id}`);
    if (!question_id || !_id) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error("Params missing");
    }
    const questioExisted = yield question_1.default.findById(question_id);
    if (!questioExisted) {
        res.status(404).json({ status: false, message: "invalid answer id cant find answer" });
        throw new Error(`user ${_id} try to up vote using an invalid question id ${question_id}`);
    }
    if ((_id === null || _id === void 0 ? void 0 : _id.toString()) == (questioExisted === null || questioExisted === void 0 ? void 0 : questioExisted.user.toString())) {
        res.status(405).json({ status: false, message: 'you cant vote your own questions' });
        throw new Error(`user ${_id} trying to vote own question ${question_id}`);
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
    let updatedQuestion = yield question_1.default.findByIdAndUpdate(question_id, update, { new: true });
    let User = yield user_1.default.findById(updatedQuestion === null || updatedQuestion === void 0 ? void 0 : updatedQuestion.user);
    yield (updatedQuestion === null || updatedQuestion === void 0 ? void 0 : updatedQuestion.populate('user', "-password"));
    if (User) {
        if (!(questioExisted === null || questioExisted === void 0 ? void 0 : questioExisted.up_vote.includes(_id)) && upvote) {
            User.reputation = User.reputation + 5;
        }
        if (!(questioExisted === null || questioExisted === void 0 ? void 0 : questioExisted.down_vote.includes(_id)) && !upvote) {
            User.reputation = User.reputation - 5;
        }
        yield User.save();
    }
    let socketInstance = (0, socket_1.getSocketIO)();
    socketInstance === null || socketInstance === void 0 ? void 0 : socketInstance.to(String(questioExisted === null || questioExisted === void 0 ? void 0 : questioExisted.user)).emit(NOTIFICATION, { message: `someone ${Boolean(upvote) ? "up vote" : "down vote"} your question` });
    logger.info(`user ${_id} is successfully ${Boolean(upvote) ? "up vote" : "down vote"} question ${question_id}`);
    res.json({ status: true, data: updatedQuestion });
}));
exports.reportQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question_id, reason } = req.body;
    const { _id } = req.user;
    if (!question_id || !reason || !_id) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error("Params missing");
    }
    const alreadyReported = yield reportedQuestions_1.default.find({ user: new mongoose_1.default.Types.ObjectId(_id), question: new mongoose_1.default.Types.ObjectId(question_id) });
    if (alreadyReported.length) {
        res.status(409).json({ status: false, message: "Question already reported" });
        throw new Error("Question already reported");
    }
    const newReport = new reportedQuestions_1.default({
        question: question_id,
        user: _id,
        reason
    });
    newReport.save();
    res.json({ status: true, data: newReport });
}));
exports.getReportedQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { start, limit, sort, search } = req.query;
    if (!req.admin) {
        res.status(401).json({
            status: false,
            message: "Unauthrized user"
        });
        throw ('Unauthorized user');
    }
    let starting = 0, limitDataTo = 5, sorting = { createdAt: -1 }, searchQuery;
    if (start) {
        starting = Number(start);
    }
    if (limit) {
        limitDataTo = Number(limit);
    }
    if (sort === "asc" || sort === "des") {
        sorting = sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 };
    }
    else if (sort) {
        res.status(400).json({ status: true, message: "params not matched" });
        throw new Error("params not matched");
    }
    const allQuestions = yield reportedQuestions_1.default.find(search ? { question: new mongoose_1.default.Types.ObjectId(String(search)) } : {}).sort(sorting).skip(starting).limit(limitDataTo).populate('user', "-password").populate('question').populate('question.user');
    res.json({ status: true, data: allQuestions });
}));
exports.bookmarkQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question_id, isAdd } = req.query;
    const { _id } = req.user;
    if (!question_id || !_id) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error(`Params missing while user ${_id} try to add question to bookmark`);
    }
    const questionExisted = yield question_1.default.findById(question_id);
    if (!questionExisted) {
        res.status(404).json({ status: false, message: "question not found" });
        throw new Error(`user ${_id} is try ing to update question ${question_id} to bookmark that not exist in database`);
    }
    if (isAdd) {
        const alreadyExist = yield bookmarkedQuestions_1.default.findOne({ user: new mongoose_1.default.Types.ObjectId(_id), Bookmarks: new mongoose_1.default.Types.ObjectId(String(question_id)) });
        if (alreadyExist) {
            res.status(409).json({ status: false, message: "Already added" });
            throw new Error(`user ${_id} is try ing to update already exist question ${question_id} to bookmark`);
        }
    }
    const update = isAdd ? { $addToSet: { Bookmarks: question_id } } : { $pull: { Bookmarks: question_id } };
    const bookMark = yield bookmarkedQuestions_1.default.findOneAndUpdate({ user: new mongoose_1.default.Types.ObjectId(_id) }, update, { upsert: true, returnOriginal: false }).populate('Bookmarks');
    res.json({ status: true, data: bookMark });
}));
exports.getBookmarkedQuestions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const bookmarks = yield bookmarkedQuestions_1.default.findOne({ user: new mongoose_1.default.Types.ObjectId(_id) }).populate('Bookmarks');
    res.json({ status: true, data: bookmarks });
}));

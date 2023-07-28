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
exports.approveEditRequest = exports.editRequest = exports.editAnswer = exports.voteAnswer = exports.answerQuestion = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const answer_1 = __importDefault(require("../models/answer"));
const question_1 = __importDefault(require("../models/question"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("../models/user"));
const answerRequest_1 = __importDefault(require("../models/answerRequest"));
const socket_1 = require("../helpers/socket");
const getDailyActivity_1 = require("../helpers/getDailyActivity");
const NOTIFICATION = "notification";
exports.answerQuestion = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question_id, html } = req.body;
    const { _id, plan } = req.user;
    const dailyActivity = yield (0, getDailyActivity_1.getDailyactivity)(_id);
    console.log('plan', plan);
    console.log('dailyActivity', dailyActivity);
    if (!question_id || !_id || !html) {
        res.status(400).json({ status: false, message: "params missing" });
        throw new Error('params missing');
    }
    if (!plan && dailyActivity.totalAnswers >= 1) {
        res.status(400).json({ status: false, message: "Please upgrade your plan" });
        throw new Error('Please upgrade your plan');
    }
    if (plan && new Date(plan.expired_date) < new Date()) {
        res.status(400).json({ status: false, message: "Plan expired please update plan" });
        throw new Error('Plan expired please update plan');
    }
    if (plan && dailyActivity.totalAnswers >= plan.plan.totalAnswers) {
        res.status(400).json({ status: false, message: "Daily Quota limit exceeded please add question tommorow or upgrade plan" });
        throw new Error('Daily Quota limit exceeded');
    }
    const userAlredyExist = yield answer_1.default.findOne({ question: new mongoose_1.default.Types.ObjectId(question_id), user: new mongoose_1.default.Types.ObjectId(_id) }).count();
    if (userAlredyExist) {
        res.status(409).json({ status: false, message: "already answered to question" });
        throw new Error(`user ${_id} already answered to question ${question_id}`);
    }
    const sanitizedHtml = (0, sanitize_html_1.default)(String(html).replace(/\"/g, "'"));
    let answer = new answer_1.default({
        question: question_id,
        user: _id,
        body: sanitizedHtml
    });
    answer.save();
    yield (0, getDailyActivity_1.updateDailyAnswerLimit)(_id);
    const User = yield user_1.default.findById(_id);
    yield question_1.default.findByIdAndUpdate(question_id, { $addToSet: { answers: answer._id } });
    res.json({ status: true, data: Object.assign(Object.assign({}, answer._doc), { user: [User] }) });
}));
exports.voteAnswer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { answer_id, upvote } = req.query;
    const { _id, name } = req.user;
    logger.info(`user ${_id} is trying to vote answer ${answer_id}`);
    if (!answer_id || !_id) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error("Params missing");
    }
    const answeExisted = yield answer_1.default.findById(answer_id);
    if (!answeExisted) {
        res.status(404).json({ status: false, message: "invalid answer id cant find answer" });
        throw new Error(`user ${_id} try to up vote using an invalid answer id ${answer_id}`);
    }
    if ((_id === null || _id === void 0 ? void 0 : _id.toString()) == ((_a = answeExisted === null || answeExisted === void 0 ? void 0 : answeExisted.user) === null || _a === void 0 ? void 0 : _a.toString())) {
        res.status(405).json({ status: false, message: 'you cant vote your own answer' });
        throw new Error(`user ${_id} trying to vote own answer ${answer_id}`);
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
    let updatedAnswer = yield answer_1.default.findByIdAndUpdate(answer_id, update, { new: true });
    let User = yield user_1.default.findById(updatedAnswer === null || updatedAnswer === void 0 ? void 0 : updatedAnswer.user);
    if (User) {
        console.log(User);
        if (!(answeExisted === null || answeExisted === void 0 ? void 0 : answeExisted.up_vote.includes(_id)) && upvote) {
            User.reputation = User.reputation + 15;
        }
        if (!(answeExisted === null || answeExisted === void 0 ? void 0 : answeExisted.down_vote.includes(_id)) && !upvote) {
            User.reputation = User.reputation - 15;
        }
        yield User.save();
    }
    let output;
    if (updatedAnswer) {
        output = Object.assign(Object.assign({}, updatedAnswer.toObject()), { user: [User] });
    }
    let socketInstance = (0, socket_1.getSocketIO)();
    socketInstance === null || socketInstance === void 0 ? void 0 : socketInstance.to(String(answeExisted.user)).emit(NOTIFICATION, { message: `someone ${Boolean(upvote) ? "up vote" : "down vote"} your answer` });
    logger.info(`user ${_id} is successfully ${Boolean(upvote) ? "up vote" : "down vote"} answer ${answer_id}`);
    res.json({ status: true, data: output });
}));
exports.editAnswer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { answer_id, html } = req.body;
    const { _id } = req.user;
    logger.info(`user ${_id} is trying to edit answer ${answer_id}`);
    if (!answer_id || !_id) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error("Params missing");
    }
    const answerExisted = yield answer_1.default.findById(answer_id);
    if (!answerExisted) {
        res.status(404).json({ status: false, message: "invalid answer id cant find answer" });
        throw new Error(`user ${_id} try to edit answer using an invalid answer id ${answer_id}`);
    }
    if ((_id === null || _id === void 0 ? void 0 : _id.toString()) !== ((_b = answerExisted === null || answerExisted === void 0 ? void 0 : answerExisted.user) === null || _b === void 0 ? void 0 : _b.toString())) {
        res.status(405).json({ status: false, message: 'you can only edit your own answer' });
        throw new Error(`user ${_id} trying to edit others answer ${answer_id}`);
    }
    const sanitizedHtml = (0, sanitize_html_1.default)(String(html).replace(/\"/g, "'"));
    const update = { body: sanitizedHtml };
    let updatedAnswer = yield answer_1.default.findByIdAndUpdate(answer_id, update, { new: true });
    logger.info(`user ${_id} is successfully edit answer ${answer_id}`);
    res.json({ status: true, data: updatedAnswer });
}));
exports.editRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { answer_id, html } = req.body;
    const { _id } = req.user;
    logger.info(`user ${_id} is trying to edit answer ${answer_id}`);
    if (!answer_id || !_id || !html) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error("Params missing");
    }
    const answer = yield answer_1.default.findById(answer_id);
    if (!answer) {
        res.status(409).json({ status: false, message: "no answer exist for this answer id" });
        throw new Error(`user ${_id} already try to request invalid  answer ${answer_id}`);
    }
    const user = yield answer_1.default.findOne({ _id: new mongoose_1.default.Types.ObjectId(answer_id), user: new mongoose_1.default.Types.ObjectId(_id) }).count();
    if (user) {
        res.status(409).json({ status: false, message: "you can't edit your own answer" });
        throw new Error("you can't edit your own answer");
    }
    const answerExisted = yield answerRequest_1.default.findOne({ answer: new mongoose_1.default.Types.ObjectId(answer_id), edited_by: new mongoose_1.default.Types.ObjectId(_id) });
    if (answerExisted) {
        res.status(409).json({ status: false, message: "already request to edit this answer" });
        throw new Error(`user ${_id} already request to edit this  answer ${answer_id}`);
    }
    const sanitizedHtml = (0, sanitize_html_1.default)(String(html).replace(/\"/g, "'"));
    let newRequest = new answerRequest_1.default({
        answer: answer_id,
        user: answer === null || answer === void 0 ? void 0 : answer.user,
        edited_by: _id,
        body: sanitizedHtml,
    });
    yield newRequest.save();
    logger.info(`user ${_id} is successfully sent edit answer request for answer ${answer_id}`);
    res.json({ status: true, data: newRequest });
}));
exports.approveEditRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ status: false, message: "you can do this unauthorized request" });
        throw new Error("user not present this request");
    }
    const { answer_id } = req.query;
    if (!answer_id) {
        res.status(400).json({ status: false, message: "Params missing" });
        throw new Error("Params missing while approving answer request");
    }
    const requestExist = yield answerRequest_1.default.findById(answer_id);
    if (!requestExist) {
        res.status(400).json({ status: false, message: "no resource for this id" });
        throw new Error("Params missing while approving answer request");
    }
    yield answer_1.default.findByIdAndUpdate(requestExist.answer, { body: requestExist.body, editedBy: requestExist.edited_by, isEdited: true });
    requestExist.isApprove = true;
    const newRequest = yield requestExist.save();
    let socketInstance = (0, socket_1.getSocketIO)();
    socketInstance === null || socketInstance === void 0 ? void 0 : socketInstance.to(String(newRequest.edited_by)).emit(NOTIFICATION, { message: `your answer is approved ` });
    res.json({ status: true, data: newRequest });
}));

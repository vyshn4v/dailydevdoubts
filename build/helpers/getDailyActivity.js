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
exports.updateDailyAnswerLimit = exports.updateDailyQuestionLimit = exports.getDailyactivity = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const dailyActivity_1 = __importDefault(require("../models/dailyActivity"));
function getDailyactivity(userId) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // Set the time to 12:00:00 am of the current day
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const res = yield dailyActivity_1.default.findOne({ user: userId, createdAt: { $gte: currentDate, $lt: nextDay } });
            if (res) {
                return resolve(res);
            }
            else {
                dailyActivity_1.default.create({ user: userId }) // Replace new Date() with your desired date value if needed.
                    .then((newDocument) => {
                    return resolve(newDocument);
                })
                    .catch((err) => {
                    reject(err);
                });
            }
        }
        catch (err) {
            reject(err);
        }
    }));
}
exports.getDailyactivity = getDailyactivity;
function updateDailyQuestionLimit(userId) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set the time to 12:00:00 am of the current day
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        dailyActivity_1.default.findByIdAndUpdate(userId, { $inc: { totalQuestions: 1 } }).then((res) => {
            return resolve(res);
        }).catch((err) => {
            reject(err);
        });
    });
}
exports.updateDailyQuestionLimit = updateDailyQuestionLimit;
function updateDailyAnswerLimit(userId) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set the time to 12:00:00 am of the current day
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        dailyActivity_1.default.findOneAndUpdate({ user: userId, createdAt: { $gte: currentDate, $lt: nextDay } }, { $inc: { totalAnswer: 1 } }).then((res) => {
            return resolve(res);
        }).catch((err) => {
            reject(err);
        });
    });
}
exports.updateDailyAnswerLimit = updateDailyAnswerLimit;

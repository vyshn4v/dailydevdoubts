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
exports.getDailyActivity = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dailyActivity_1 = __importDefault(require("../models/dailyActivity"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.getDailyActivity = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const currentDate = new Date();
    const nextYearDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
    const result = yield dailyActivity_1.default.aggregate([
        {
            $match: {
                user: new mongoose_1.default.Types.ObjectId(_id),
                createdAt: { $gte: currentDate, $lte: nextYearDate },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                },
                totalQuestions: { $sum: '$totalQuestions' },
            },
        },
        {
            $group: {
                _id: {
                    year: '$_id.year',
                    month: '$_id.month',
                },
                dailyContributions: {
                    $push: {
                        day: '$_id.day',
                        contributionCount: '$totalQuestions',
                    },
                },
            },
        },
        {
            $group: {
                _id: {
                    year: '$_id.year',
                },
                monthlyContributions: {
                    $push: {
                        month: '$_id.month',
                        dailyContributions: '$dailyContributions',
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                monthlyContributions: 1,
            },
        },
    ]);
    // Generate the skeleton structure
    const skeleton = Array.from({ length: 12 }, (_, monthIndex) => ({
        month: monthIndex + 1,
        dailyContributions: Array.from({ length: 31 }, (_, dayIndex) => ({
            day: dayIndex + 1,
            contributionCount: 0,
        })),
    }));
    // Merge the skeleton with the actual data
    result.forEach((yearData) => {
        const { year, monthlyContributions } = yearData;
        const yearIndex = year - currentDate.getFullYear();
        monthlyContributions.forEach((monthData) => {
            const { month, dailyContributions } = monthData;
            skeleton[yearIndex].monthlyContributions[month - 1].dailyContributions = dailyContributions;
        });
    });
    // The final output will be the skeleton merged with the actual data
    const finalOutput = skeleton.slice(0, currentDate.getMonth() + 1);
    console.log(result);
    res.json(result);
}));

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
exports.dashBoardData = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const chats_1 = __importDefault(require("../models/chats"));
const question_1 = __importDefault(require("../models/question"));
const user_1 = __importDefault(require("../models/user"));
exports.dashBoardData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsersInMonth = yield user_1.default.find({
        $where: function () {
            var currentDate = new Date();
            var lastMonthDate = new Date(currentDate.setMonth(currentDate.getMonth()));
            return this.createdAt.getFullYear() === lastMonthDate.getFullYear()
                && this.createdAt.getMonth() === lastMonthDate.getMonth();
        }
    }).count();
    const currentDate = new Date();
    const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const totalGroupInMonth = yield chats_1.default.countDocuments({
        createdAt: {
            $gte: lastMonthDate,
            $lt: currentDate
        },
        isGroupChat: true
    });
    const totalQuestionsInMonth = yield question_1.default.countDocuments({
        createdAt: {
            $gte: lastMonthDate,
            $lt: currentDate
        }
    });
    // dash board
    //month wise data
    const FIRST_MONTH = 1;
    const LAST_MONTH = 12;
    const TODAY = new Date();
    const YEAR_BEFORE = new Date(TODAY);
    YEAR_BEFORE.setFullYear(YEAR_BEFORE.getFullYear() - 1);
    const MONTHS_ARRAY = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const pipeLine = [{
            $match: {
                createdAt: { $gte: YEAR_BEFORE, $lte: TODAY }
            }
        },
        {
            $group: {
                _id: { year_month: { $substrCP: ["$createdAt", 0, 7] } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.year_month": 1 }
        },
        {
            $project: {
                _id: 0,
                count: 1,
                month_year: {
                    $concat: [
                        { $arrayElemAt: [MONTHS_ARRAY, { $subtract: [{ $toInt: { $substrCP: ["$_id.year_month", 5, 2] } }, 1] }] },
                        "-",
                        { $substrCP: ["$_id.year_month", 0, 4] }
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                data: { $push: { k: "$month_year", v: "$count" } }
            }
        },
        {
            $addFields: {
                start_year: { $substrCP: [YEAR_BEFORE, 0, 4] },
                end_year: { $substrCP: [TODAY, 0, 4] },
                months1: { $range: [{ $toInt: { $substrCP: [YEAR_BEFORE, 5, 2] } }, { $add: [LAST_MONTH, 1] }] },
                months2: { $range: [FIRST_MONTH, { $add: [{ $toInt: { $substrCP: [TODAY, 5, 2] } }, 1] }] }
            }
        },
        {
            $addFields: {
                template_data: {
                    $concatArrays: [
                        {
                            $map: {
                                input: "$months1",
                                as: "m1",
                                in: {
                                    count: 0,
                                    month_year: {
                                        $concat: [
                                            { $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m1", 1] }] },
                                            "-",
                                            "$start_year"
                                        ]
                                    }
                                }
                            }
                        },
                        {
                            $map: {
                                input: "$months2",
                                as: "m2",
                                in: {
                                    count: 0,
                                    month_year: {
                                        $concat: [
                                            { $arrayElemAt: [MONTHS_ARRAY, { $subtract: ["$$m2", 1] }] },
                                            "-",
                                            "$end_year"
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            $addFields: {
                data: {
                    $map: {
                        input: "$template_data",
                        as: "t",
                        in: {
                            k: "$$t.month_year",
                            v: {
                                $reduce: {
                                    input: "$data",
                                    initialValue: 0,
                                    in: {
                                        $cond: [
                                            { $eq: ["$$t.month_year", "$$this.k"] },
                                            { $add: ["$$this.v", "$$value"] },
                                            { $add: [0, "$$value"] }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                data: { $arrayToObject: "$data" },
                _id: 0
            }
        }];
    const questionChart = yield question_1.default.aggregate(pipeLine);
    const userChart = yield user_1.default.aggregate(pipeLine);
    const chatChart = yield chats_1.default.aggregate([
        {
            $match: {
                isGroupChat: true
            }
        },
        ...pipeLine
    ]);
    const data = {
        totalUsersInMonth,
        totalGroupInMonth,
        totalQuestionsInMonth,
        questionChart,
        userChart,
        chatChart
    };
    res.json({ status: true, data });
}));

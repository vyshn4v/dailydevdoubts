import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import { CustomRequest } from '../types/requsetObject';
import { Response } from 'express';
import Chat from '../models/chats';
import Questions from '../models/question';
import user from '../models/user';
export const dashBoardData = asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    if (!req.admin) {
        res.json({
            status: false,
            message: "Unauthrized user"
        })
        throw ('Unauthorized user')
    }
    const totalUsersInMonth = await user.find({
        $where: function () {
            var currentDate = new Date();
            var lastMonthDate = new Date(currentDate.setMonth(currentDate.getMonth()))
            return this.createdAt.getFullYear() === lastMonthDate.getFullYear()
                && this.createdAt.getMonth() === lastMonthDate.getMonth();
        }
    }).count()
    const currentDate = new Date();
    const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const totalGroupInMonth = await Chat.countDocuments({
        createdAt: {
            $gte: lastMonthDate,
            $lt: currentDate
        },
        isGroupChat: true
    });
    const totalQuestionsInMonth = await Questions.countDocuments({
        createdAt: {
            $gte: lastMonthDate,
            $lt: currentDate
        }
    });



    // dash board

    //month wise data
    const FIRST_MONTH = 1
    const LAST_MONTH = 12
    const TODAY = new Date()
    const YEAR_BEFORE = new Date(TODAY)
    YEAR_BEFORE.setFullYear(YEAR_BEFORE.getFullYear() - 1)
    const MONTHS_ARRAY = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const pipeLine:any = [{
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
    }]
    const questionChart = await Questions.aggregate(pipeLine)
    const userChart = await user.aggregate(pipeLine)
    const chatChart = await Chat.aggregate([
        {
            $match: {
                isGroupChat: true
            }
        },
        ...pipeLine
    ]as any)

    const data = {
        totalUsersInMonth,
        totalGroupInMonth,
        totalQuestionsInMonth,
        questionChart,
        userChart,
        chatChart
    }
    res.json({status:true,data})
})
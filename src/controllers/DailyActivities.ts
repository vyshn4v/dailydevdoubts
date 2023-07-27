import mongoose from "mongoose";
import DailyActivity from "../models/dailyActivity";
import { CustomRequest } from "../types/requsetObject";
import asyncHandler from 'express-async-handler';
import { Response } from "express";

export const  getDailyActivity= asyncHandler(async (req: CustomRequest, res: Response): Promise<any> => {
    const {_id}=req.user
    const currentDate = new Date();
const nextYearDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

const result = await DailyActivity.aggregate([
  {
    $match: {
      user: new mongoose.Types.ObjectId(_id),
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
const skeleton:any = Array.from({ length: 12 }, (_, monthIndex) => ({
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
  monthlyContributions.forEach((monthData:any) => {
    const { month, dailyContributions } = monthData;
    skeleton[yearIndex].monthlyContributions[month - 1].dailyContributions = dailyContributions;
  });
});

// The final output will be the skeleton merged with the actual data
const finalOutput = skeleton.slice(0, currentDate.getMonth() + 1);
    console.log(result);
    res.json(result)
})
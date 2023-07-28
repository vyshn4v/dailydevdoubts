"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const daily_activity_schema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    totalQuestions: { type: Number, default: 1 },
    totalAnswer: { type: Number, default: 1 },
}, { timestamps: true });
const DailyActivity = (0, mongoose_1.model)('daily_activities', daily_activity_schema);
exports.default = DailyActivity;

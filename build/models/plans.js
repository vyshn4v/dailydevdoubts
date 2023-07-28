"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const plans_schema = new mongoose_1.Schema({
    plan: { type: String, require: true },
    totalQuestions: { type: Number, default: 5 },
    totalAnswers: { type: Number, default: 5 },
    totalDays: { type: Number, default: 30 },
    price: { type: Number, default: 200 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
const Plans = (0, mongoose_1.model)('plans', plans_schema);
exports.default = Plans;

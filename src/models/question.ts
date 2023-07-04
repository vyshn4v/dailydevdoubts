import mongoose, { Schema, model } from "mongoose";
import { Question } from "../types/Question";


const questions_schema = new Schema<Question>({
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    title: { type: String, require: true },
    body: { type: String, require: true },
    tags: [{ type: String }],
    answers: [{ type: Schema.Types.ObjectId, ref: 'answers' }],
    views: { type: Number, default: 0 },
    isApprove: { type: Boolean, default: false },
    up_vote: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    down_vote: [{ type: Schema.Types.ObjectId }],
}, { timestamps: true })

const Question = model('questions', questions_schema)
export default Question 
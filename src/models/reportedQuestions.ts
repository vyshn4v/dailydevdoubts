import mongoose, { Schema, model } from "mongoose";


const reported_questions_schema = new Schema({
    question: { type: mongoose.Types.ObjectId, ref: "questions" },
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    reason: { type: String, require: true },
    status: { type: Boolean, default: false },
}, { timestamps: true })

const reportedQuestions = model('reportedQuestions', reported_questions_schema)
export default reportedQuestions 
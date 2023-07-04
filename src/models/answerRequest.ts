import mongoose, { Schema, model } from "mongoose";


const answer_request_schema = new Schema({
    answer: { type: mongoose.Types.ObjectId, ref: "answers" },
    edited_by: { type: mongoose.Types.ObjectId, ref: "users" },
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    isApprove: { type: Boolean, default: false },
    body: { type: String, require: true },
}, { timestamps: true })

const AnswerRequest = model('answer_requests', answer_request_schema)
export default AnswerRequest 
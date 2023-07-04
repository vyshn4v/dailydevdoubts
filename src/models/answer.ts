import mongoose, { Schema, model } from "mongoose";


const answer_schema = new Schema({
    question: { type: mongoose.Types.ObjectId, ref: "questions" },
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    isEdited: { type: Boolean, default: false },
    editedBy: { type: mongoose.Types.ObjectId, ref: "users" },
    body: { type: String, require: true },
    up_vote: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    down_vote: [{ type: Schema.Types.ObjectId, ref: 'users' }]
}, { timestamps: true })

const Answer = model('answers', answer_schema)
export default Answer 
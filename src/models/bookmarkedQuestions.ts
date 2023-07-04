import mongoose, { Schema, model } from "mongoose";

const bookmark_question_schema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    Bookmarks: [{ type: Schema.Types.ObjectId, ref: 'questions' }]
}, { timestamps: true })

const BookmarkedQuestions = model('bookmarkedQuestions', bookmark_question_schema)
export default BookmarkedQuestions 
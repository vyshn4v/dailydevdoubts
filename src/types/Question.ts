import mongoose from "mongoose";
import { Schema } from "mongoose";

export interface Question {
    user: typeof Schema.Types.ObjectId,
    title: String,
    body: String,
    tags: typeof Array<String>,
    isApprove: Boolean,
    views: number,
    answers: Array<Schema.Types.ObjectId>,
    up_vote: Array<Schema.Types.ObjectId>,
    down_vote: Array<Schema.Types.ObjectId>,
    _id: Schema.Types.ObjectId,
    createdAt: NativeDate;
    updatedAt: NativeDate;
}
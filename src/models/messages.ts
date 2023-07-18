import mongoose, { Schema, model } from "mongoose";


const message_schema = new Schema({
    user:{ type: Schema.Types.ObjectId, ref: 'users' },
    message: { type: String},
}, { timestamps: true })

const Message = model('messages', message_schema)
export default Message 
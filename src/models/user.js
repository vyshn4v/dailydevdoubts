import mongoose, { Schema, model } from "mongoose";


const user_schema = new Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    phone: { type: Number, require: true },
    password: { type: String, require: true },
    isBanned: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    following_user: Array,
    isSignupWithGoogle: { type: Boolean, default: false }
}, { timestamps: true })

const user = model('users', user_schema)
export default user 
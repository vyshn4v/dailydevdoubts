import mongoose, { Schema, model } from "mongoose";
import { User } from "../types/user";


const user_schema = new Schema<User>({
    name: { type: String, require: true },
    email: { type: String, require: true },
    phone: { type: Number },
    profile_image: { type: String, default: "https://img.freepik.com/free-icon/user_318-159711.jpg" },
    password: { type: String, require: true },
    isBanned: { type: Boolean, default: false },
    reputation: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    following_user: Array,
    isSignupWithGoogle: { type: Boolean, default: false }
}, { timestamps: true })

const user = model('users', user_schema)
export default user 
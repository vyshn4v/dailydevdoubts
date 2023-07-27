"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const badge_schema = new mongoose_1.Schema({
    badge: { type: String },
    count: { type: Number, default: 0 },
});
const user_schema = new mongoose_1.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    phone: { type: Number },
    profile_image: { type: String, default: "https://img.freepik.com/free-icon/user_318-159711.jpg" },
    password: { type: String, require: true },
    isBanned: { type: Boolean, default: false },
    badges: [{ type: badge_schema }],
    reputation: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    following_user: Array,
    isSignupWithGoogle: { type: Boolean, default: false }
}, { timestamps: true });
const user = (0, mongoose_1.model)('users', user_schema);
exports.default = user;

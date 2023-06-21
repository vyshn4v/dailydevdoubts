"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_schema = new mongoose_1.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    phone: { type: Number, require: true },
    password: { type: String, require: true },
    isBanned: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    following_user: Array,
    isSignupWithGoogle: { type: Boolean, default: false }
}, { timestamps: true });
const user = (0, mongoose_1.model)('users', user_schema);
exports.default = user;

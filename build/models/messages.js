"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const message_schema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    message: { type: String },
}, { timestamps: true });
const Message = (0, mongoose_1.model)('messages', message_schema);
exports.default = Message;

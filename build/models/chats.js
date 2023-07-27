"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const User_schema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    role: { type: String, default: 'user' }
});
const chat_schema = new mongoose_1.Schema({
    isGroupChat: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
    profile_image: { type: String, default: 'https://media.istockphoto.com/id/1279949844/vector/a-bunch-of-users-icon-illustration-in-line-style-social-media-group-profile-icon-friends.jpg?s=170667a&w=0&k=20&c=WZKUfxUB7ASWf9ev3DreoZY9MwtN2yfF949TqYe3R_4=' },
    users: [{
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'users' },
            role: { type: String, default: 'user' }
        }],
    name: { type: String, default: null },
    messages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'messages' }]
}, { timestamps: true });
const Chat = (0, mongoose_1.model)('chats', chat_schema);
exports.default = Chat;

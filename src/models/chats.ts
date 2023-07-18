import mongoose, { Schema, model } from "mongoose";
const User_schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    role: { type: String, default: 'user' }
})

const chat_schema = new Schema({
    isGroupChat: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
    profile_image: { type: String,default:'https://media.istockphoto.com/id/1279949844/vector/a-bunch-of-users-icon-illustration-in-line-style-social-media-group-profile-icon-friends.jpg?s=170667a&w=0&k=20&c=WZKUfxUB7ASWf9ev3DreoZY9MwtN2yfF949TqYe3R_4=' },
    users: [{
        user: { type: Schema.Types.ObjectId, ref: 'users' },
        role: { type: String, default: 'user' }
    }],
    name: { type: String, default: null },
    messages: [{ type: Schema.Types.ObjectId, ref: 'messages' }]
}, { timestamps: true })

const Chat = model('chats', chat_schema)
export default Chat 
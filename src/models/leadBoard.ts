import mongoose, { Schema, model } from "mongoose";


const leadboard_schema = new Schema({
    users: [{ type: mongoose.Types.ObjectId, ref: "users" }],
}, { timestamps: true })

const Leadboard = model('leadboard', leadboard_schema)
export default Leadboard 
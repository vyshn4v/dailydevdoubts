import mongoose, { Schema, model } from "mongoose";

const daily_activity_schema = new Schema({
    user:{type:Schema.Types.ObjectId,ref:'users'},
    totalQuestions:{type:Number,default:1},
    totalAnswer:{type:Number,default:1},
}, { timestamps: true })

const DailyActivity = model('daily_activities', daily_activity_schema)
export default DailyActivity 
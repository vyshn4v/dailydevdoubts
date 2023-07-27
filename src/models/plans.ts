import mongoose, { Schema, model } from "mongoose";

const plans_schema = new Schema({
    plan:{ type: String,require:true },
    totalQuestions:{type:Number,default:5},
    totalAnswers:{type:Number,default:5},
    totalDays:{type:Number,default:30},
    price:{type:Number,default:200},
    isActive:{type:Boolean,default:true}
}, { timestamps: true })

const Plans = model('plans', plans_schema)
export default Plans 
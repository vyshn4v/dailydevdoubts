import mongoose, { Schema, model } from "mongoose";


const advertisement_schema = new Schema({
    image: { type: String },
    label: { type: String },
    websiteUrl: { type: String },
    expired_At: { type: Date }
}, { timestamps: true })

const Advertisement = model('advertisement', advertisement_schema)
export default Advertisement 
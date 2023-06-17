import mongoose from "mongoose";
import { MONGODB_URL } from "./envVariables";


export default function connectMongodb() {
    return mongoose.connect(MONGODB_URL).then(() => {
        console.log("Database is connected");
    }).catch(() => {
        throw "database Error"
    })
}
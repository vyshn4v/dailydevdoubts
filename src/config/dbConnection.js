import mongoose from "mongoose";


export default function connectMongodb() {
    return mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log("Database is connected");
    }).catch(() => {
        throw "database Error"
    })
}
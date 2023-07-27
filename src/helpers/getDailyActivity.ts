import mongoose, { ObjectId } from "mongoose"
const ObjectId=mongoose.Types.ObjectId
import DailyActivity from "../models/dailyActivity"


export function getDailyactivity(userId: ObjectId): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {

            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0); // Set the time to 12:00:00 am of the current day
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const res = await DailyActivity.findOne({ user: userId, createdAt: { $gte: currentDate, $lt: nextDay } })
                if (res) {
                    return resolve(res);
                } else {
                    DailyActivity.create({ user: userId }) // Replace new Date() with your desired date value if needed.
                        .then((newDocument) => {
                            return resolve(newDocument);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }

        } catch (err) {
            reject(err)
        }

    })
}
export function updateDailyQuestionLimit(userId: ObjectId): Promise<any> {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set the time to 12:00:00 am of the current day
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        DailyActivity.findByIdAndUpdate(userId, { $inc: { totalQuestions: 1 } }).then((res) => {
            return resolve(res);
        }).catch((err) => {
            reject(err)
        })
    })
}
export function updateDailyAnswerLimit(userId: ObjectId): Promise<any> {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set the time to 12:00:00 am of the current day
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        DailyActivity.findOneAndUpdate({ user:userId, createdAt: { $gte: currentDate, $lt: nextDay } }, { $inc: { totalAnswer: 1 } }).then((res) => {
            return resolve(res);
        }).catch((err) => {
            reject(err)
        })
    })
}
import { Types } from 'mongoose';
import mongoose from 'mongoose'



import cron from 'node-cron'
import user from '../models/user';
import Question from '../models/question';
import Leadboard from '../models/leadboard';

const badges = [
    { badge: "Bronze", count: 0 },
    { badge: "Silver", count: 0 },
    { badge: "Gold", count: 0 }
]


export default function verifyBadge() {
    cron.schedule('0 0 * * *', () => {
        badge()
    })
}

async function badge() {
    try {

        const users = await user.find({})
        users?.map(async (user: any) => {
            if (user?.badges?.length === 0) {
                user.badges = badges
                await user.save()
            }
            const totalQuestion = await Question.find({ user: new mongoose.Types.ObjectId(String(user._id)), isApprove: true }).count()
            if (user?.badges) {
                if (totalQuestion >= ((user?.badges[0]?.count + 1) * 10) && totalQuestion >= 10) {
                    user.badges[0].count = getFirstDigits(totalQuestion)
                    await user.save()
                }
                if (user?.badges[0]?.count >= ((user?.badges[1]?.count + 1) * 10) && user?.badges[0]?.count >= 10) {
                    user.badges[1].count = user?.badges[0]?.count
                    await user.save()
                }
                if (user.reputation >= ((user?.badges[2]?.count + 1) * 10)) {
                    user.badges[2].count = getFirstDigits(user.reputation)
                    await user.save()
                }
            }
        })
        const topTenUsers = users.sort((a, b) => b.reputation - a.reputation).slice(0, 10).map((user) => user._id)
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set the time to 12:00:00 am of the current day
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const leadbordExist = await Leadboard.exists({
            createdAt: { $gte: currentDate, $lt: nextDay },
        });
        if (!leadbordExist) {
            const leadBoard = new Leadboard({
                users: topTenUsers
            })
            await leadBoard.save()
        }
    } catch (err) {
        console.log(err)
    }

}

function getFirstDigits(number: number) {
    const numberString: string = number.toString();

    return parseInt(numberString.substr(0, numberString.length - 1));

}
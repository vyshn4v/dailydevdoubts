import express from "express";
const app = express()
import authRouter from "./routes/authRoute"
import cors from "cors"
import http from 'http'
const server = http.createServer(app)

import dbConnection from "./config/dbConnection"
import logger from "./helpers/quick-logger"
import errorHandler from "./helpers/errorHandler";
import userRouter from "./routes/userRoute";
import { verifyUserToken } from "./middleware/userTokenverifivation";
import questionRouter from "./routes/questionRoute";
import answerRouter from "./routes/answerRoute";
import chatRouter from "./routes/chatRouter";
import dashboardRouter from "./routes/dashboardRoute";
import planRouter from "./routes/planRouter";
import verifyBadge from "./helpers/badge";
import { initializeSocket } from "./helpers/socket";
import dailyActivityRouter from "./routes/dailyActivity";
import advertiseMent from "./routes/advertisMent";
declare global {
    var logger: any;
}
global.logger = logger
const port = process.env.port || 3000
dbConnection().then(() => {
    console.log('db connected successfully');
}).catch(() => {
    console.log('db connected successfully');
})
initializeSocket(server)
verifyBadge()
function jsonReviver(key: any, value: any) {
    if (typeof value === 'string' && value.toLowerCase() === 'false') {
        return false;
    }
    if (typeof value === 'string' && value.toLowerCase() === 'true') {
        return true
    }
    return value;
}
app.use(express.json({ reviver: jsonReviver }))
app.use(cors({
    origin: "*"
}))
app.use("/api/auth", authRouter)
app.use("/api/user", verifyUserToken, userRouter)
app.use("/api/question", verifyUserToken, questionRouter)
app.use("/api/answer", verifyUserToken, answerRouter)
app.use("/api/chat", verifyUserToken, chatRouter)
app.use("/api/dashboard", verifyUserToken, dashboardRouter)
app.use("/api/plans", verifyUserToken, planRouter)
app.use("/api/daily-activity", verifyUserToken, dailyActivityRouter)
app.use("/api/advertisement", verifyUserToken, advertiseMent)

app.use(errorHandler)

const url = server.listen(port, () => {
    const address = url.address();
    if (address && typeof address !== 'string') {
        const { address: host, port } = address;

        console.log(`Server listening at http://[${host}]:${port}`);
        console.log(`Server listening at http://localhost:${port}`);
    }
})
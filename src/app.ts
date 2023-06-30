import express from "express";
const app = express()
import authRouter from "./routes/authRoute"
import cors from "cors"
import dbConnection from "./config/dbConnection"
import logger from "./helpers/quick-logger"
import errorHandler from "./helpers/errorHandler";
import userRouter from "./routes/userRoute";
import { verifyUserToken } from "./middleware/userTokenverifivation";
import questionRouter from "./routes/questionRoute";
import answerRouter from "./routes/answerRoute";
declare global {
    var logger: any;
}
global.logger = logger
const port = process.env.port || 3000
dbConnection()

app.use(express.json())
app.use(cors())

app.use("/api/auth", authRouter)
app.use("/api/user",verifyUserToken, userRouter)
app.use("/api/question",verifyUserToken, questionRouter)
app.use("/api/answer",verifyUserToken, answerRouter)

app.use(errorHandler)

app.listen(port, () => {
    console.log('server connected to ' + port);
})
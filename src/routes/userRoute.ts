import express from "express"
import { CustomRequest } from "../types/requsetObject";
import { VerifyOtpUser } from "../controllers/Auth";
const userRouter = express.Router()

userRouter.post('/otp' , VerifyOtpUser)


export default userRouter
import express from "express"
import { ResendOtpUser, VerifyOtpUser } from "../controllers/Auth";
import { AddQuestion } from "../controllers/Question";
import { getAllUsers, getProfile, manageUser } from "../controllers/User";
const userRouter = express.Router()

userRouter.post('/otp', VerifyOtpUser)
userRouter.get('/otp', ResendOtpUser)
userRouter.get('/all-users', getAllUsers)
userRouter.put('/manage', manageUser)
userRouter.get('/profile', getProfile)




export default userRouter
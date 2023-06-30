import express from "express"
import { VerifyOtpUser } from "../controllers/Auth";
import { AddQuestion } from "../controllers/Question";
import { getAllUsers, manageUser } from "../controllers/User";
const userRouter = express.Router()

userRouter.post('/otp', VerifyOtpUser)
userRouter.get('/all-users', getAllUsers)
userRouter.put('/manage', manageUser)




export default userRouter
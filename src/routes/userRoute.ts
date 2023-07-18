import express from "express"
import { ResendOtpUser, VerifyOtpUser } from "../controllers/Auth";
import { AddQuestion } from "../controllers/Question";
import { followUnfollowUser, getAllUsers, getProfile, manageUser, uploadImage } from "../controllers/User";
import upload from "../middleware/cloudinary";
const userRouter = express.Router()

userRouter.post('/otp', VerifyOtpUser)
userRouter.get('/otp', ResendOtpUser)
userRouter.get('/all-users', getAllUsers)
userRouter.put('/manage', manageUser)
userRouter.get('/profile', getProfile)
userRouter.put('/follow-unfollow', followUnfollowUser)
userRouter.put('/profile',upload.single('image'), uploadImage)




export default userRouter
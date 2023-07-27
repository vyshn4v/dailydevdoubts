import express from "express"
import { adminLogin, loginWithGoogle, signupWithGmail, userLogin, userSignup, refreshToken } from "../controllers/Auth"
const dailyActivityRouter = express.Router()
import { createValidator } from "express-joi-validation"
const validator = createValidator()
import { userLoginSchema, userSignupSchema } from "../helpers/validation"
import { createChat, deleteGroup, getAllChats, sendMessage } from "../controllers/Chat"
import upload from "../middleware/cloudinary";
import { getDailyActivity } from "../controllers/DailyActivities"

dailyActivityRouter.get('/', getDailyActivity)


export default dailyActivityRouter
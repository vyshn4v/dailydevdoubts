import express from "express"
import { adminLogin, loginWithGoogle, signupWithGmail, userLogin, userSignup, refreshToken } from "../controllers/Auth"
const chatRouter = express.Router()
import { createValidator } from "express-joi-validation"
const validator = createValidator()
import { userLoginSchema, userSignupSchema } from "../helpers/validation"
import { createChat, deleteGroup, getAllChats, sendMessage } from "../controllers/Chat"
import upload from "../middleware/cloudinary";

chatRouter.post('/',upload.single('image'), createChat)
chatRouter.get('/', getAllChats)
chatRouter.post('/message/:chat_id', sendMessage)
chatRouter.delete('/:chat_id', deleteGroup)


export default chatRouter
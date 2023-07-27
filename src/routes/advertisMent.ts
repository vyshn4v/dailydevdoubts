import express from "express"
import { adminLogin, loginWithGoogle, signupWithGmail, userLogin, userSignup, refreshToken, ResendOtpToPhone, changePassword } from "../controllers/Auth"
const advertiseMent = express.Router()
import { createValidator } from "express-joi-validation"
const validator = createValidator()
import { userLoginSchema, userSignupSchema } from "../helpers/validation"
import upload from "../middleware/cloudinary"
import { addAdvertiseMent, deleteAdvertisement, getAds } from "../controllers/advertiseMent"

advertiseMent.post('/', upload.single('image'),addAdvertiseMent )
advertiseMent.get('/', getAds )
advertiseMent.delete('/', deleteAdvertisement )



export default advertiseMent
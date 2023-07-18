import express from "express"
import { adminLogin, loginWithGoogle, signupWithGmail, userLogin, userSignup, refreshToken } from "../controllers/Auth"
const authRouter = express.Router()
import { createValidator } from "express-joi-validation"
const validator = createValidator()
import { userLoginSchema, userSignupSchema } from "../helpers/validation"

authRouter.get('/login', validator.query(userLoginSchema), userLogin)
authRouter.get('/admin-login', validator.query(userLoginSchema), adminLogin)
authRouter.post("/signup", validator.body(userSignupSchema), userSignup)
authRouter.post("/signup-with-google", signupWithGmail)
authRouter.get("/login-with-google", loginWithGoogle)
authRouter.post("/refresh-token", refreshToken)


export default authRouter
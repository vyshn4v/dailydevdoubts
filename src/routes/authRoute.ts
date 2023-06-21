import express from "express"
import { loginWithGoogle, signupWithGmail, userLogin, userSignup } from "../controllers/Auth"
const authRouter = express.Router()
import { createValidator } from "express-joi-validation"
const validator = createValidator()
import { userLoginSchema, userSignupSchema } from "../helpers/validation"

authRouter.get('/login', validator.query(userLoginSchema), userLogin)
authRouter.post("/signup", validator.body(userSignupSchema), userSignup)
authRouter.post("/signup-with-google", signupWithGmail)
authRouter.get("/login-with-google", loginWithGoogle)


export default authRouter
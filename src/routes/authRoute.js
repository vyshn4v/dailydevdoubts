import express from "express"
import { userLogin, userSignup } from "../controllers/Auth.js"
const authRouter = express.Router()
import { createValidator } from "express-joi-validation"
const validator = createValidator()
import { userLoginSchema, userSignupSchema } from "../helpers/validation.js"

authRouter.get('/login', validator.body(userLoginSchema), userLogin)
authRouter.post("/signup", validator.body(userSignupSchema), userSignup)


export default authRouter
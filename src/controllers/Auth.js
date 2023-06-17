import asyncHandler from "express-async-handler"
import user from "../models/user.js"
import bcrypt from "bcrypt"
import sendMessageUsingTwilio from "../helpers/sendMessageTwilio.js"
import { BCRYPT_SALT_ROUND } from "../config/envVariables.js"

export const userSignup = asyncHandler(async (req, res) => {
    const { username, email, phone, password } = req.body
    if (!username || !email || !phone || !password) {
        res.status(440).json({
            status: false,
            message: "parameter is missing user signup failed"
        })
        throw new Error("parameter is missing user signup failed")
    }

    logger.info(`user ${username} trying to signup`,)
    const PhoneOrEmailAlreadyTaken = await user.find({ $or: [{ phone }, { email }] }).count()
    if (PhoneOrEmailAlreadyTaken) {
        res.status(440).json({
            status: false,
            message: "Phone or Email is already Taken"
        })
        throw new Error("Phone or Email is already Taken")
    }
    const generatedSalt = await bcrypt.genSalt(BCRYPT_SALT_ROUND)
    const hashedPassword = await bcrypt.hash(password, generatedSalt)
    const User = new user({
        name: username,
        email,
        phone,
        password: hashedPassword
    })
    User.save()
    logger.info(`user ${User.name} success fully signed in user id : ${User._id}`)
    await sendMessageUsingTwilio(User.phone, "SIGNUP")
    res.json(User)
})


export const userLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    console.log(req.body);
})
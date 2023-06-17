import asyncHandler from "express-async-handler"
import user from "../models/user"
import bcrypt from "bcrypt"
import sendMessageUsingTwilio from "../helpers/sendMessageTwilio"
import { BCRYPT_SALT_ROUND } from "../config/envVariables"
import { Request, Response } from "express"
import { Person } from "../types/user.js"


export const userSignup = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, phone, password, confirm_password } = req.body
    if (!username || !email || !phone || !password || !confirm_password) {
        res.status(440).json({
            status: false,
            message: "parameter is missing user signup failed"
        })
        throw new Error("parameter is missing user signup failed")
    }

    logger.info(`user ${username} trying to signup`,)

    if (password !== confirm_password) {
        res.status(401).json({
            status: false,
            message: "passwords are not matched"
        })
        throw new Error("passwords are not matched")
    }
    const PhoneOrEmailAlreadyTaken: number = await user.find({ $or: [{ phone }, { email }] }).count()
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
    res.json({
        status: true,
        data: {
            "name": User.name,
            "email": User.email,
            "phone": User.phone,
            "isBanned": User.isBanned,
            "isVerified": User.isVerified,
            "following_user": User.following_user,
            "isSignupWithGoogle": User.isSignupWithGoogle,
            "_id": User._id,
            "createdAt": User.createdAt,
            "updatedAt": User.updatedAt,
        }
    })
})


export const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const User = await user.findOne<Person>({ email })
    if (!User) {
        res.status(404).json({
            status: false,
            message: "Enter a valid email address"
        })
        throw Error("invalid email id in login field :" + email)
    }
    const passwordStatus = await bcrypt.compare(password, User.password)
    if (!passwordStatus) {
        res.status(401).json({
            status: false,
            message: "Enter a valid password"
        })
        throw Error("invalid password in login field :" + email)
    }

    res.json(User)
})
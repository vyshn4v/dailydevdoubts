import asyncHandler from "express-async-handler"
import user from "../models/user"
import bcrypt from "bcrypt"
import { sendOtpUsingTwilio, verifyOtpUsingTwilio } from "../helpers/sendMessageTwilio"
import { BCRYPT_SALT_ROUND, GOOGLE_CLIENT_ID } from "../config/envVariables"
import { Request, Response } from "express"
import { Person, personWithOutPassword } from "../types/user.js"
import { generateJwtToken } from "../helpers/jwtToken"
import { CustomRequest } from "../types/requsetObject"
import hashPassword from "../helpers/passwordHashing"
import passwordValidation from "../helpers/passwordValidation"
import axios from "axios"

export const userSignup = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, phone, password, confirm_password } = req.body
    console.log(req.body);

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
    const hashedPassword = await hashPassword(password)
    const User = new user({
        name: username,
        email,
        phone,
        password: hashedPassword
    })
    User.save()
    logger.info(`user ${User.name} success fully signed in user id : ${User._id}`)
    await sendOtpUsingTwilio(User.phone, "SIGNUP")
    const token = await generateJwtToken({ _id: User._id })
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
            "token": token
        }
    })
})
export const userLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.query
    const User = await user.findOne<Person>({ email })
    if (!User) {
        res.status(404).json({
            status: false,
            message: "Enter a valid email address"
        })
        throw Error("invalid email id in login field :" + email)
    }
    logger.info(`user ${User.name} trying to login`,)
    const passwordStatus = passwordValidation(String(password), User.password)
    if (!passwordStatus) {
        res.status(401).json({
            status: false,
            message: "Enter a valid password"
        })
        throw Error("invalid password in login field :" + email)
    }
    const token: string = await generateJwtToken({ _id: User._id, isOtpVerified: false })
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
            "token": token
        }
    })
})
export const VerifyOtpUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { Otp } = req.body
    const { phone, _id } = req.user
    console.log(Otp, phone, _id);

    if (!Otp) {
        res.status(400).json({
            status: false,
            message: "Otp field is required"
        })
    }
    const OtpStatus: any = await verifyOtpUsingTwilio(phone, Otp)
    if (OtpStatus && OtpStatus.status === "approved") {
        await user.findByIdAndUpdate({ _id }, { isVerified: true })
        res.json({
            status: true,
            data: OtpStatus.status
        })
    } else {
        res.json({
            status: false,
            message: "otp is not verifed"
        })
    }
})
export const signupWithGmail = asyncHandler(async (req: CustomRequest, res: Response) => {
    const googleTOken: string = String(req.body.googleTOken)
    if (!googleTOken) {
        res.status(400).json({
            status: false,
            message: "missing google token"
        })
    }
    const payload = await (await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleTOken}`)).data
    if (payload) {
        console.log(payload);
        const existedUser = await user.findOne({ email: payload.email })
        if (!existedUser) {
            const hashedPassword = await hashPassword(payload.sub)
            const User = new user({
                name: payload.name,
                email: payload.email,
                isSignupWithGoogle: true,
                password: hashedPassword,
                isVerified: payload.email_verified
            })
            User.save()
            const token: string = await generateJwtToken({ _id: User._id, isOtpVerified: false })
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
                    "token": token
                }
            })
        } else {
            res.status(406).json({ status: false, message: "already signup with email please login" })
        }
    }

})
export const loginWithGoogle = asyncHandler(async (req: CustomRequest, res: Response) => {
    const googleTOken: string = String(req.query.googleTOken)

    if (!googleTOken) {
        res.status(400).json({
            status: false,
            message: "missing google token"
        })
    }
    const payload = await (await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleTOken}`)).data
    if (payload) {
        const existedUser = await user.findOne({ email: payload.email })
        if (existedUser) {
            const passwordStatus = await passwordValidation(payload.sub, existedUser.password)
            if (passwordStatus) {
                res.json({
                    status: true, data: {
                        "name": existedUser.name,
                        "email": existedUser.email,
                        "phone": existedUser.phone,
                        "isBanned": existedUser.isBanned,
                        "isVerified": existedUser.isVerified,
                        "following_user": existedUser.following_user,
                        "isSignupWithGoogle": existedUser.isSignupWithGoogle,
                        "_id": existedUser._id,
                        "createdAt": existedUser.createdAt,
                        "updatedAt": existedUser.updatedAt,
                    }
                })
            }
        }else{
            res.status(404).json({status:false,message:"user not exist"})
        }
    }

})

import asyncHandler from "express-async-handler"
import user from "../models/user"
import bcrypt from "bcrypt"
import { sendOtpUsingTwilio, verifyOtpUsingTwilio } from "../helpers/sendMessageTwilio"
import { ADMIN_EMAIL, ADMIN_PASSWORD, BCRYPT_SALT_ROUND, GOOGLE_CLIENT_ID, JWT_SECRET_KEY } from "../config/envVariables"
import { Request, Response } from "express"
import { User, UsernWithOutPassword } from "../types/user.js"
import { generateJwtToken } from "../helpers/jwtToken"
import { CustomRequest } from "../types/requsetObject"
import hashPassword from "../helpers/passwordHashing"
import passwordValidation from "../helpers/passwordValidation"
import axios from "axios"
import generateUserOutputWithouPasswordtsts from "../helpers/generateUserOutputWithouPassword"
import jwt, { JwtPayload } from "jsonwebtoken"
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
    const hashedPassword: string = await hashPassword(password)
    const User = new user({
        name: username,
        email,
        phone,
        password: hashedPassword
    })
    User.save()
    logger.info(`user ${User.name} success fully signed in user id : ${User._id}`)
    await sendOtpUsingTwilio(User.phone, "SIGNUP")
    const token: string = await generateJwtToken({ _id: User._id }, "5d")
    const refreshToken = await generateJwtToken({ user: User.name }, "1m")
    res.json({
        status: true,
        data: generateUserOutputWithouPasswordtsts(User, token, refreshToken)
    })
})
export const userLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.query
    const User = await user.findOne<User>({ email })
    if (!User) {
        res.status(404).json({
            status: false,
            message: "Enter a valid email address"
        })
        throw Error("invalid email id in login field :" + email)
    }
    logger.info(`user ${User.name} trying to login`,)
    if (User.isSignupWithGoogle) {
        res.status(409).json({
            status: false,
            message: 'Email is registered with google try to login using google'
        })
        throw new Error('googles registered user try to login with email and password')
    }
    const passwordStatus: boolean = await passwordValidation(String(password), User.password)
    if (!passwordStatus) {
        res.status(401).json({
            status: false,
            message: "Enter a valid password"
        })
        throw Error("invalid password in login field :" + email)
    }
    if (!User.isVerified) {
        await sendOtpUsingTwilio(User.phone, "SIGNUP")
    }
    const token: string = await generateJwtToken({ _id: User._id, isOtpVerified: false }, "1d")
    const refreshToken: string = await generateJwtToken({ user: User.name }, "1m")
    res.json({
        status: true,
        data: generateUserOutputWithouPasswordtsts(User, token, refreshToken)
    })
})
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.query
    if (email !== ADMIN_EMAIL) {
        res.status(404).json({
            status: false,
            message: "Enter a valid email address"
        })
        throw Error("invalid email id in login field :" + email)
    }
    logger.info(`admin ${email} trying to login`,)
    const passwordStatus = (password === ADMIN_PASSWORD)
    // await passwordValidation(String(password), User.password)
    if (!passwordStatus) {
        res.status(401).json({
            status: false,
            message: "Enter a valid password"
        })
        throw Error("invalid password in login field :" + email)
    }
    const token: string = await generateJwtToken({ email }, "1d")
    const refreshToken: string = await generateJwtToken({ user: "admin" }, "1m")
    res.json({
        status: true,
        data: {
            "email": email,
            "token": token
        }
    })
})
export const VerifyOtpUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { Otp } = req.body
    const { phone, _id } = req.user

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
        const existedUser: User | null = await user.findOne({ email: payload.email })
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
            const token: string = await generateJwtToken({ _id: User._id, isOtpVerified: false }, "1d")
            const refreshToken: string = await generateJwtToken({ user: User.name }, "1m")
            res.json({
                status: true,
                data: generateUserOutputWithouPasswordtsts(User, token, refreshToken)
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
        const existedUser: User | null = await user.findOne({ email: payload.email })
        if (existedUser) {
            const passwordStatus = await passwordValidation(payload.sub, existedUser.password)
            if (passwordStatus) {
                const token: string = await generateJwtToken({ _id: existedUser._id, isOtpVerified: false }, "1d")
                const refreshToken: string = await generateJwtToken({ user: existedUser.name }, "1m")
                res.json({
                    status: true,
                    data: generateUserOutputWithouPasswordtsts(existedUser, token, refreshToken)
                })
            }
        } else {
            res.status(404).json({ status: false, message: "user not exist" })
        }
    }

})
export const verifyRefreshToken = asyncHandler(async (req: CustomRequest, res: Response) => {
    const refreshToken: string = String(req.body.refreshToken)

    if (!refreshToken) {
        res.status(400).json({
            status: false,
            message: "missing google token"
        })
    }
    jwt.verify(refreshToken, JWT_SECRET_KEY, (err, decoded): any => {
        if (err) {
            res.status(498).json({ status: false, message: "Token malformed" })
        }
        // const refreshtoken=
        res.json({ status: true, message: "refreshtoken validated" });
    })

})


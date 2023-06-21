import { Response, NextFunction } from "express"
import asyncHandler from "express-async-handler";
import { verifyJwtToken } from "../helpers/jwtToken";
import { CustomRequest } from "../types/requsetObject";
import user from "../models/user";

export const verifyUserToken = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token: string | undefined = req.headers.authorization?.split(' ')[1]
    if (!token) {
        res.json({
            status: false,
            message: "Token not found"
        })
        throw Error("Token Not Found")
    }
    const decode = await verifyJwtToken(token)
    const currentTime = new Date()
    if (decode.exp && decode.exp > (currentTime.getTime() / 1000)) {
        const User = await user.findById({ _id: decode._id })
        if (User) {
            req.user = User
            next()
        } else {
            res.json({
                status: false,
                message: "User not found"
            })
            throw Error("user not found")
        }
    } else {
        res.json({
            status: false,
            message: "Token Expired"
        })
        throw Error("Token Expired")
    }
})
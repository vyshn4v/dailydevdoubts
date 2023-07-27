import { Response, NextFunction } from "express"
import asyncHandler from "express-async-handler";
import { verifyJwtToken } from "../helpers/jwtToken";
import { CustomRequest } from "../types/requsetObject";
import user from "../models/user";
import { ADMIN_EMAIL } from "../config/envVariables";
import { JwtPayload } from "jsonwebtoken";

export const verifyUserToken = asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token: string | undefined = req.headers.authorization?.split(' ')[1]
    if (!token) {
        res.json({
            status: false,
            message: "Token not found"
        })
        throw Error("Token Not Found")
    }
    const decode:JwtPayload = await verifyJwtToken(token)
    const currentTime = new Date()
    if (decode?.exp && decode?.exp > (currentTime.getTime() / 1000)) {
        if (decode?.email === ADMIN_EMAIL) {
            req.admin = decode?.email
            return next()
        }

        const User = await user.findById({ _id: decode?._id }).populate('plan').populate({
            path: 'plan',
            populate: {
                path: 'plan',
                model: 'plans',
            },
        })
        if (User) {
            if (User.isBanned) {
                res.json({
                    status: false,
                    message: "User is banned"
                })
                throw Error(`Banned user ${User.name}is try to access`)
            }
            req.user = User
            next()
        } else {
            res.status(404).json({
                status: false,
                message: "User not found"
            })
            throw Error("user not found")
        }
    } else {
        res.status(401).json({
            status: false,
            message: "Token Expired"
        })
        throw Error("Token Expired")
    }
})
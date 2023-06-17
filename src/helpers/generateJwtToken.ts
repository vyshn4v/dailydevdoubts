import jwt, { JwtHeader } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/envVariables";


export default function genrateJwtToken(data: JwtHeader): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(data, JWT_SECRET_KEY, { expiresIn: "2d" }, function (err: any, token: any) {
            if (err) {
                reject(err)
            }
            resolve(token)
        })
    })
}
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/envVariables";


export function generateJwtToken(data: any,expiresIn: string): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(data, JWT_SECRET_KEY, { expiresIn }, function (err: any, token: any) {
            if (err) {
                reject(err)
            }
            resolve(token)
        })
    })
}
export function verifyJwtToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET_KEY, (err, decoded): any => {
            if (err) {
                reject(err);
            }
            resolve(decoded as JwtPayload);
        });
    })
}
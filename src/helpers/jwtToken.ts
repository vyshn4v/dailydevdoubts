import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_EXPIRED_TIME, JWT_REFRESH_SECRET_KEY, JWT_REFRESH_TOKEN_EXPIRED_TIME, JWT_SECRET_KEY } from "../config/envVariables";


export function generateJwtToken(data: any,expiresIn: string): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(data, JWT_SECRET_KEY, { expiresIn:JWT_ACCESS_TOKEN_EXPIRED_TIME }, function (err: any, token: any) {
            if (err) {
                reject(err)
            }
            resolve(token)
        })
    })
}
export function generateRefreshToken(data: any,expiresIn: string): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(data, JWT_REFRESH_SECRET_KEY, { expiresIn:JWT_REFRESH_TOKEN_EXPIRED_TIME }, function (err: any, token: any) {
            if (err) {
                reject(err)
            }
            resolve(token)
        })
    })
}
export function verifyJwtToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
        try{
            jwt.verify(token, JWT_SECRET_KEY, (err, decoded): any => {
                if (err) {
                    reject(err);
                }
                resolve(decoded as JwtPayload);
            });
        }catch(err){
            reject(err)
        }
    })
}
export function verifyRefreshToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_REFRESH_SECRET_KEY, (err, decoded): any => {
            if (err) {
                reject(err);
            }
            resolve(decoded as JwtPayload);
        });
    })
}
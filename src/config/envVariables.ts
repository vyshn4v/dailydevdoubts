import dotenv from "dotenv"
dotenv.config()
const BCRYPT_SALT_ROUND: number = Number(process.env.BCRYPT_SALT_ROUND)
const MONGODB_URL: string = String(process.env.MONGODB_URL)
const NODE_ENV: string = String(process.env.NODE_ENV)
const TWILIO_ACCOUNT_SID: string = String(process.env.TWILIO_ACCOUNT_SID)
const TWILIO_AUTH_TOKEN: string = String(process.env.TWILIO_AUTH_TOKEN)
const TWILIO_PHONE_NUMBER: string = String(process.env.TWILIO_PHONE_NUMBER)
const JWT_SECRET_KEY: string = String(process.env.JWT_SECRET_KEY)
export {
    BCRYPT_SALT_ROUND,
    MONGODB_URL,
    NODE_ENV,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    JWT_SECRET_KEY
}
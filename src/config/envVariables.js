import dotenv from "dotenv"
dotenv.config()
const BCRYPT_SALT_ROUND = Number(process.env.BCRYPT_SALT_ROUND)
const MONGODB_URL = process.env.MONGODB_URL
const NODE_ENV = process.env.NODE_ENV
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
export {
    BCRYPT_SALT_ROUND,
    MONGODB_URL,
    NODE_ENV,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
}
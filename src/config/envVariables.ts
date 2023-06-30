import dotenv from "dotenv"
dotenv.config()
const BCRYPT_SALT_ROUND: number = Number(process.env.BCRYPT_SALT_ROUND)
const MONGODB_URL: string = String(process.env.MONGODB_URL)
const NODE_ENV: string = String(process.env.NODE_ENV)
const TWILIO_ACCOUNT_SID: string = String(process.env.TWILIO_ACCOUNT_SID)
const TWILIO_AUTH_TOKEN: string = String(process.env.TWILIO_AUTH_TOKEN)
const TWILIO_PHONE_NUMBER: string = String(process.env.TWILIO_PHONE_NUMBER)
const TWILIO_SERVICE_SID: string = String(process.env.TWILIO_SERVICE_SID)
const JWT_SECRET_KEY: string = String(process.env.JWT_SECRET_KEY)
const GOOGLE_CLIENT_ID: string = String(process.env.GOOGLE_CLIENT_ID)
const ADMIN_EMAIL: string = String(process.env.ADMIN_EMAIL)
const ADMIN_PASSWORD: string = String(process.env.ADMIN_PASSWORD)
export {
    BCRYPT_SALT_ROUND,
    MONGODB_URL,
    NODE_ENV,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    JWT_SECRET_KEY,
    TWILIO_SERVICE_SID,
    GOOGLE_CLIENT_ID,
    ADMIN_EMAIL,
    ADMIN_PASSWORD
}
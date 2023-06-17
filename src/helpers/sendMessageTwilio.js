import Twilio from "twilio";
import generateMessageTemplate from "./generateMessageTemplate.js";
import otpGenerator from 'otp-generator'
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from '../config/envVariables.js'
const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

export default function sendMessageUsingTwilio(to, template) {
    return new Promise((resolve, reject) => {
        const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
        client.messages.create({
            body: generateMessageTemplate(template, { otp }),
            from: process.env.TWILIO_PHONE_NUMBER,
            to: "+91" + to
        }).then(message => {
            resolve(message)
        }).catch(err => {
            reject(err)
        })
    })
}


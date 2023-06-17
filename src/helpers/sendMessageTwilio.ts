import Twilio from "twilio";
import generateMessageTemplate from "./generateMessageTemplate";
import otpGenerator from 'otp-generator'
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from '../config/envVariables'
import { TwilioMessage } from "../types/twilioMessage";
const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

export default function sendMessageUsingTwilio(to: number | undefined, template: string) {
    return new Promise((resolve, reject) => {
        const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
        const message: TwilioMessage = {
            body: generateMessageTemplate(template, { otp }),
            from: TWILIO_PHONE_NUMBER,
            to: "+91" + to

        }
        client.messages.create(message).then(message => {
            resolve(message)
        }).catch(err => {
            reject(err)
        })
    })
}


import Twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_SERVICE_SID } from '../config/envVariables'
const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

export function sendOtpUsingTwilio(to: number | undefined, template: string) {
    return new Promise((resolve, reject) => {

        const message: { to: string, channel: string } = {
            to: "+91" + String(to), channel: "sms"
        }
        client.verify.v2?.services(TWILIO_SERVICE_SID).verifications.create(message).then(message => {
            resolve(message)
        }).catch(err => {
            reject(err)
        })
    })
}

export function verifyOtpUsingTwilio(to: number, code: string) {
    return new Promise((resolve, reject) => {
        const message: { to: string, code: string } = {
            to: "+91" + String(to), code
        }
        client.verify.v2?.services(TWILIO_SERVICE_SID).verificationChecks.create(message).then(message => {
            resolve(message)
        }).catch(err => {
            reject(err)
        })
    })
}

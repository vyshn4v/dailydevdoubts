"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpUsingTwilio = exports.sendOtpUsingTwilio = void 0;
const twilio_1 = __importDefault(require("twilio"));
const envVariables_1 = require("../config/envVariables");
const client = (0, twilio_1.default)(envVariables_1.TWILIO_ACCOUNT_SID, envVariables_1.TWILIO_AUTH_TOKEN);
function sendOtpUsingTwilio(to, template) {
    return new Promise((resolve, reject) => {
        var _a;
        const message = {
            to: "+91" + String(to), channel: "sms"
        };
        (_a = client.verify.v2) === null || _a === void 0 ? void 0 : _a.services(envVariables_1.TWILIO_SERVICE_SID).verifications.create(message).then(message => {
            resolve(message);
        }).catch(err => {
            reject(err);
        });
    });
}
exports.sendOtpUsingTwilio = sendOtpUsingTwilio;
function verifyOtpUsingTwilio(to, code) {
    return new Promise((resolve, reject) => {
        var _a;
        const message = {
            to: "+91" + String(to), code
        };
        (_a = client.verify.v2) === null || _a === void 0 ? void 0 : _a.services(envVariables_1.TWILIO_SERVICE_SID).verificationChecks.create(message).then(message => {
            resolve(message);
        }).catch(err => {
            reject(err);
        });
    });
}
exports.verifyOtpUsingTwilio = verifyOtpUsingTwilio;

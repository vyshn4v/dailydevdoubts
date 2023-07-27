"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyJwtToken = exports.generateRefreshToken = exports.generateJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const envVariables_1 = require("../config/envVariables");
function generateJwtToken(data, expiresIn) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(data, envVariables_1.JWT_SECRET_KEY, { expiresIn: envVariables_1.JWT_ACCESS_TOKEN_EXPIRED_TIME }, function (err, token) {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}
exports.generateJwtToken = generateJwtToken;
function generateRefreshToken(data, expiresIn) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(data, envVariables_1.JWT_REFRESH_SECRET_KEY, { expiresIn: envVariables_1.JWT_REFRESH_TOKEN_EXPIRED_TIME }, function (err, token) {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}
exports.generateRefreshToken = generateRefreshToken;
function verifyJwtToken(token) {
    return new Promise((resolve, reject) => {
        try {
            jsonwebtoken_1.default.verify(token, envVariables_1.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                resolve(decoded);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.verifyJwtToken = verifyJwtToken;
function verifyRefreshToken(token) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, envVariables_1.JWT_REFRESH_SECRET_KEY, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded);
        });
    });
}
exports.verifyRefreshToken = verifyRefreshToken;

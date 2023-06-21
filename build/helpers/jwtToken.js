"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtToken = exports.generateJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const envVariables_1 = require("../config/envVariables");
function generateJwtToken(data) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(data, envVariables_1.JWT_SECRET_KEY, { expiresIn: "2d" }, function (err, token) {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });
}
exports.generateJwtToken = generateJwtToken;
function verifyJwtToken(token) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, envVariables_1.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                reject(err);
            }
            resolve(decoded);
        });
    });
}
exports.verifyJwtToken = verifyJwtToken;

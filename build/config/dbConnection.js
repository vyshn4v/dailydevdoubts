"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const envVariables_1 = require("./envVariables");
function connectMongodb() {
    return mongoose_1.default.connect(envVariables_1.MONGODB_URL).then(() => {
        console.log("Database is connected");
    }).catch(() => {
        throw "database Error";
    });
}
exports.default = connectMongodb;

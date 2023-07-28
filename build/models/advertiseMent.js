"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const advertisement_schema = new mongoose_1.Schema({
    image: { type: String },
    label: { type: String },
    expired_At: { type: Date }
}, { timestamps: true });
const Advertisement = (0, mongoose_1.model)('advertisement', advertisement_schema);
exports.default = Advertisement;

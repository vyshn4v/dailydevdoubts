"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const envVariables_1 = require("../config/envVariables");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
cloudinary_1.v2.config({
    cloud_name: envVariables_1.CLOUDINARY_CLOUD_NAME,
    api_key: envVariables_1.CLOUDINARY_API_KEY,
    api_secret: envVariables_1.CLOUDINARY_API_SECRET,
});
const fileFilter = (req, file, cb) => {
    // Check if the file meets the desired criteria
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        // Accept the file
        cb(null, true);
    }
    else {
        // Reject the file
        cb(null, false);
    }
};
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
});
const upload = (0, multer_1.default)({ storage: storage, fileFilter: fileFilter });
exports.default = upload;

import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../config/envVariables";
import { Express } from "express";
import multer, { FileFilterCallback } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { CustomRequest } from "../types/requsetObject";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});
const fileFilter = (req: CustomRequest, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Check if the file meets the desired criteria
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        // Accept the file
        cb(null, true);
    } else {
        // Reject the file
        cb(null, false);
    }
};
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
});


const upload = multer({ storage: storage, fileFilter: fileFilter });
export default upload
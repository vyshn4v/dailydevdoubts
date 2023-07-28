"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advertiseMent = express_1.default.Router();
const express_joi_validation_1 = require("express-joi-validation");
const validator = (0, express_joi_validation_1.createValidator)();
const cloudinary_1 = __importDefault(require("../middleware/cloudinary"));
const advertiseMent_1 = require("../controllers/advertiseMent");
advertiseMent.post('/', cloudinary_1.default.single('image'), advertiseMent_1.addAdvertiseMent);
advertiseMent.get('/', advertiseMent_1.getAds);
advertiseMent.delete('/', advertiseMent_1.deleteAdvertisement);
exports.default = advertiseMent;

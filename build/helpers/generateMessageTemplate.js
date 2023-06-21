"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateMessageTemplate(template, data) {
    switch (template) {
        case "SIGNUP":
            return `${data === null || data === void 0 ? void 0 : data.otp} is Your otp for verify dailydevdoubts profile`;
        default:
            return "";
    }
}
exports.default = generateMessageTemplate;

export default function generateMessageTemplate(template, data) {
    switch (template) {
        case "SIGNUP":
            return `${data?.otp} is Your otp for verify dailydevdoubts profile`
        default:
            return
    }
}
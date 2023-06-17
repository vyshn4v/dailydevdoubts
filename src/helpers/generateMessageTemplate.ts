export default function generateMessageTemplate(template: string, data: any): string {
    switch (template) {
        case "SIGNUP":
            return `${data?.otp} is Your otp for verify dailydevdoubts profile`
        default:
            return ""
    }
}
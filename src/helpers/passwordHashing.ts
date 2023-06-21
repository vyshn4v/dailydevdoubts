import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUND } from "../config/envVariables"


const hashPassword = (password: string | undefined): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const generatedSalt = await bcrypt.genSalt(BCRYPT_SALT_ROUND)
            const hashedPassword = await bcrypt.hash(String(password), generatedSalt)
            resolve(hashedPassword)
        } catch (err) {
            reject(err)
        }
    })
}
export default hashPassword
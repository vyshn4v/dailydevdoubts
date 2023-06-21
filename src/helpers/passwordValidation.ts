import bcrypt from 'bcrypt';
const passwordValidation = async (password: string, hashedPassword: string | undefined) => {
    return await bcrypt.compare(password, String(hashedPassword))
}

export default passwordValidation
import Joi from "joi"

const userSignupSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email({ tlds: { allow: false } }),
    phone: Joi.number().min(1000000000).max(9999999999).required(),
    password: Joi.string().length(16).required(),
    confirm_password: Joi.string().length(16).required()
})
const userLoginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }),
    password: Joi.string().length(16).required(),
})

export {
    userSignupSchema,
    userLoginSchema
}
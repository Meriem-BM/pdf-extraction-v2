import Joi from "joi"

const schemas = {

    // Login request validation
    Login: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
    
    // Signup request validation
    Signup: Joi.object().keys({
        email: Joi.string().required().regex(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/),
        name: Joi.string().required(),
        password: Joi.string().required(),
        passwordConfirmation: Joi.string().required(),
    })
}

export default schemas;
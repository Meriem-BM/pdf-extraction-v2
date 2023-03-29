import tokenHelper from "../helpers/token";
import User from "../models/User";

const userController = {
    signup: async (data: any) => {
        const mailformat = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return new Promise(async (resolve, reject) => {
            let errors: Array<string> = [];
            if (data.email) {
                data.email = data.email.toLowerCase()
                if (!data.email.match(mailformat)) {
                    errors.push('The email is not valid');
                }
            }

            // password strength
            if (data.password.length < 8) {
                errors.push('Short password!! must be at least 8 characters');
            }
            console.log(data.password);
            if (!data.password.match(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/)) {
                errors.push('Low password strength!! must contain at least 1 uppercase letter, 1 number, 1 lowercase letters and 1 special characters');
            }

            // confirmation of the password
            if (data.password !== data.passwordConfirmation) {
                errors.push('The password inputs does not match');
            }
            if (errors.length) {
                return reject({ status: 400, message: errors });
            }
            
            const user = new User(data);
            // checking if the user is already in the database
            const emailExist = await user.getOne({ filters: { email: data.email }, removed: false });
            if (emailExist) {
                return reject({
                    status: 400,
                    message: 'Email already exists'
                });
            }
            
            const newUser = new User(data);
            await newUser.addProvider({
                provider: 'password',
                password: data.password
            }).catch((e: any) => {
                return reject(e);
            });
            
            const savedUser = await newUser.save().catch(e => {
                return reject(e);
            });
            
            tokenHelper.generate(savedUser, data.rememberMe).then(token => {
                return resolve({
                    token: token
                });
            }).catch((err: any) => {
                return reject(err);
            });
        });
    }
};

export default userController;

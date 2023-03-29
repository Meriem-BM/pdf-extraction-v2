import tokenHelper from "../helpers/token";
import passwordHelper from "../helpers/password";
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
    },
    login: async (data: any) => {
        return new Promise(async (resolve, reject) => {
          const { email, phone, username } = data
          if (!email && !phone && !username) {
            return reject({
              status: 400,
              message: 'Please provide email, phone or username.'
            })
          }
          let filter: { [key: string]: string } = {}
          const phoneFormat = /^[0-9]{10,14}$/
          const mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (email) {
            filter.email = email.toLowerCase()
          } else if (phone) {
            if (!phoneFormat.test(phone)) {
              return reject({
                status: 400,
                message: 'Phone number is not valid.'
              })
            }
            filter.phone = phone
            if (filter.phone[0] !== '+') filter.phone = '+' + filter.phone
          } else if (username) {
            if (username.match(mailformat)) {
              filter.email = username.toLowerCase()
            } else if (phoneFormat.test(username)) {
              filter.phone = username
              if (filter.phone[0] !== '+') filter.phone = '+' + filter.phone
            } else {
              return reject({
                status: 400,
                message: 'Invalid login! enter your email or phone number'
              })
            }
          }
          const user = new User(data)
          const query = `FOR u IN users FILTER LOWER(u.${Object.keys(filter)[0]}) == "${filter[Object.keys(filter)[0]]}" && !u.isremoved RETURN u`
          const result = await user.query(query).catch(e => {
            return reject(e)
          })
          const userData = result[0]
          if (!userData) {
            return reject({
              status: 404,
              message: 'User not found!'
            })
          } else {
            const provider = userData.providers.find(provider => provider.provider === 'password')
            if (!provider) {
              return reject({
                status: 401,
                message: 'No password! you can add one by clicking on the button "Forgot password"'
              })
            } else {
              if (await passwordHelper.verify(data.password, provider.password, provider.salt)) {
                tokenHelper.generate(userData, data.rememberMe).then(token => {
                  return resolve({
                    token: token
                  })
                })
              } else {
                return reject({
                  status: 401,
                  message: 'Wrong password'
                })
              }
            }
          }
        })
      },
      
};

export default userController;

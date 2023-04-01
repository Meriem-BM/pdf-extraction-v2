import tokenHelper from "../helpers/token";
import passwordHelper from "../helpers/password";
import User from "../models/user";

const userController = {
  signup: async (data: any) => {
    return new Promise(async (resolve, reject) => {
      let errors: Array<string> = [];
      if (data.email) data.email = data.email.toLowerCase();

      // password strength
      if (
        !data.password.match(
          /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/
        )
      ) {
        errors.push(
          "Low password strength!! must contain at least 1 uppercase letter, 1 number, 1 lowercase letters and 1 special characters"
        );
      }

      if (data.password !== data.passwordConfirmation)
        errors.push("The password inputs does not match");

      if (errors.length) return reject({ status: 400, message: errors });

      const user = new User(data);

      // checking if the user is already in the database
      const emailExist = await user
        .getOne({
          filters: { email: data.email },
          removed: false,
        })
        .catch((err) => {
          return reject(err);
        });

      if (emailExist) {
        return reject({
          status: 400,
          message: "Email already exists",
        });
      }

      const newUser = new User(data);
      await newUser
        .addProvider({
          provider: "password",
          password: data.password,
        })
        .catch((e: any) => {
          return reject(e);
        });

      const savedUser = await newUser.save().catch((e) => {
        return reject(e);
      });

      tokenHelper
        .generate(savedUser, data.rememberMe)
        .then((token) => {
          return resolve({
            token: token,
          });
        })
        .catch((err: any) => {
          return reject(err);
        });
    });
  },
  login: async (data: any) => {
    return new Promise(async (resolve, reject) => {
      const { email, password } = data;
      if (!email) {
        return reject({
          status: 400,
          message: "Please provide your email.",
        });
      }
      let filter: { [key: string]: string } = {};
      if (email) filter.email = email.toLowerCase();
      const user = new User(data);
      const query = `FOR u IN users FILTER LOWER(u.${
        Object.keys(filter)[0]
      }) == "${filter[Object.keys(filter)[0]]}" && !u.isremoved RETURN u`;
      const result = await user.query(query).catch((e) => {
        return reject(e);
      });
      const userData = result[0];
      if (!userData) {
        return reject({
          status: 404,
          message: "User not found!",
        });
      } else {
        const provider = userData.providers.find(
          (provider: any) => provider.provider === "password"
        );
        if (!provider) {
          return reject({
            status: 401,
            message: "No password! try to add your password.",
          });
        } else {
          if (
            await passwordHelper.verify(
              data.password,
              provider.password,
              provider.salt
            )
          ) {
            tokenHelper.generate(userData, data.rememberMe).then((token) => {
              return resolve({
                token: token,
              });
            });
          } else {
            return reject({
              status: 401,
              message: "Wrong password",
            });
          }
        }
      }
    });
  },
};

export default userController;

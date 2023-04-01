import Request from "./Request";
import passwordHelper from "../helpers/password";

interface userData {
  username: string;
  password: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class User extends Request {
  constructor(data: userData) {
    super(data);
    this.username = data.username;
    this.password = data.password;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  async addProvider(provider: { provider: string; password: string }) {
    return new Promise(async (resolve, reject) => {
      switch (provider.provider) {
        case "password":
          if (this.providers.find((v: any) => v.provider === "password")) {
            return reject({ message: "already exist" });
          } else {
            const p = await passwordHelper.hash(provider.password);
            this.providers.push({
              ...p,
              provider: "password",
            });
            return resolve(this.providers);
          }
        default:
          return reject({ message: "provider not found" });
      }
    });
  }
}

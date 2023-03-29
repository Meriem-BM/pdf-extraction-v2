import Request from "./Request";

interface userData {
     username: string;
    password: string;
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export default class User extends Request {

  constructor(data : userData) {
    super(data)
    this.username = data.username;
    this.password = data.password;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
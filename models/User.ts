export class User {
  username: string;
  password: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data : User) {
    this.username = data.username;
    this.password = data.password;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  save() {
    
  }

  get() {

  }

  update() {

  }

  delete() {
    
  }
}
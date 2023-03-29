import Request from './Request';

interface tokenData {
  user: string;
  token: string;
  expires?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default class Token extends Request {

    constructor(data : tokenData) {
      super(data);
      this.user = data.user;
      this.token = data.token;
      this.expires = data.expires;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
}
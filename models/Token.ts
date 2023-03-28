export class Token {
    user: string;
    token: string;
    expires: Date;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  
    constructor(data : Token) {
      this.user = data.user;
      this.token = data.token;
      this.expires = data.expires;
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
import jwt from 'jsonwebtoken';
import Token from "../models/Token";

function saveToken(key: string, tokenUser: string) {
    const data = {
        user: key,
        token: tokenUser,
    };
    const tokenObject = new Token(data)
    tokenObject.save()
}

const tokenHelper = {
    generate: (userData: any, rememberMe: string) => {
        return new Promise<string>((resolve, reject) => {
        const accessToken = jwt.sign({_key: userData._key, email: userData.email}, process.env.PrivateKey, { expiresIn: rememberMe ? '180d' : '1d' })
        saveToken(userData._key, accessToken);
        resolve(accessToken);
        })
    },
  
  verify: (token: string) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.PrivateKey, function(err: any, decoded: any) {
        if (err) {
          return reject({
            status: 403,
            message: 'Token is not valid'
          })
        } else {
          const findToken = new Token({user: decoded._key, token: token});
          if (!decoded._key) {
            return reject({status: 403, message: 'Invalid token!'})
          }
          findToken.getOne({filters: {user: decoded._key, isActive: true, token: token}, removed: false, }).then((result: any) => {
            if (result) {
              return resolve(decoded)
            } else {
              return reject({
                status: 403,
                message: 'Token is not valid'
              })
            }
          })
        }
      });
    })
  },
} 
  
export default tokenHelper;

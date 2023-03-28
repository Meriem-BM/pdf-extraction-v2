import jwt from 'jsonwebtoken';
const Token = require("../models/Token");

function saveToken(key: string, tokenUser: string) {
  const data = {
    user: key,
    token: tokenUser,
  }
  const tokenObject = new Token(data)
  tokenObject.save()
}

const tokenHelper = {
  generate: (userData: any, provider: string, providerID: string, rememberMe: string) => {
    return new Promise((resolve, reject) => {
      const accessToken = jwt.sign({_id: userData._id, _key: userData._key, email: userData.email, phone: userData.phone, provider, providerID}, process.env.PrivateKey, { expiresIn: rememberMe ? '180d' : '1d' })
      saveToken(userData._key, accessToken)
      resolve(accessToken)
    })
  },
  verify: (token: string) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.PrivateKey, function(err, decoded) {
        if (err) {
          return reject({
            status: 403,
            message: 'Token is not valid'
          })
        } else {
          const findToken = new Token({})
          if (!decoded._key) {
            if (decoded._id) decoded._key = decoded._id.split('/')[1]
            else return reject({status: 403, message: 'Invalid token!'})
          }
          findToken.getOne({
            filters: {user: decoded._key, isActive: true, token: token}
          }).then((result: any) => {
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
  
module.exports = tokenHelper
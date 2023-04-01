const {verify} = require('../helpers/token')

module.exports = {
    auth: async (req: any, res: any, next: any) => {
        let token = req.headers.authorization
        if (!token) {
            return res.status(401).send('No token was given')
        }
        const t = token.split(' ')
        verify(t[t.length-1]).then((decoded: any) => {
                res.locals.user = decoded._key
                next()
            }).catch((err: any) => {
                return res.status(401).send('Invalid token!')
            })
    }
}
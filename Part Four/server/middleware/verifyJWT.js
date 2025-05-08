const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized - No Bearer token' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(403).json({
                message: 'Forbidden - Invalid or expired token'
            })
        }
//מדוע לא מוכן לעשות את הפונקציות בפוסטמן אם יש את הif הזה??
        req.user = decoded
        next()
    })
}

module.exports = verifyJWT
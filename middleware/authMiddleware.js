const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1]
    if (!token) return res.status(401).json({message: "Not authorized, token missing"})

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decode.id).select('-password')
        next()
    } catch (e) {
        res.status(401).json({message: "Not authorized", error: e.message})
    }
}

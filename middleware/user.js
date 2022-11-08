const User = require('../models/user');

module.exports = async function(req, res, next) {
    if(!req.session.user){
        return next();
    }

    req.user = await User.findById(req.session.user._id);
    res.locals.user = req.user;
    next()
}
function authenticate(req, res, next) {

    if (req.session.user) {
        return next();
    }

    return res.status(401).json({
        message: "Please login first."
    });

}

module.exports = authenticate;
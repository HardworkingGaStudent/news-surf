const authenticate = {
    isAuthenticated: (req, res, next) => {
        if (!req.session.user) {
            res.redirect("/users/login");
            return;
        };
        next();
    },

    setAuthUserVar: (req, res, next) => {
        res.locals.authUser = null;
        if (req.session.user) {
            res.locals.authUser = req.session.user;
        };
        next();
    }
};

module.exports = authenticate;
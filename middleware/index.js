var middlewareObj = {};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/entrar");
};

middlewareObj.isAdmin = function isLoggedIn(req, res, next) {
    if(req.user && req.user.isAdmin) {
        return next();
    }
    res.redirect("/entrar");
};

module.exports = middlewareObj;
var middlewareObj = {};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/entrar");
};

middlewareObj.isAdmin = function isAdmin(req, res, next) {
    if(req.user && req.user.isAdmin) {
        return next();
    }
    req.flash("error", "Ação permitida apenas para administradores");
    res.redirect("/entrar");
};

module.exports = middlewareObj;
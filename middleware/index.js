var Comment = require("../models/comment");

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

middlewareObj.checkCommentOwnership = function(req, res, next){
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, comment){
            if(err || !comment){
                req.flash("error", "Comentário não encontrado");
                res.redirect("back");
            } else {
                if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "Você não tem permissão para essa ação");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Você precisa estar logado para fazer isso");
        res.redirect("back");
    } 
};

module.exports = middlewareObj;
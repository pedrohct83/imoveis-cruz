// Require dependencies
var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    User = require("../models/user"),
    middleware = require("../middleware/"),
    handleErrorModRef = require("../modules/handleError");

// INDEX - Show admin page
router.get("/", middleware.isAdmin, function(req, res) {
    res.render("admin/index");
});

// USERS - Show users page
router.get("/usuarios", middleware.isAdmin, function(req, res) {
    User.find().exec(function(err, users) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.render("admin/users", { users, page: "usuarios" });
        }
    });
});

// NEW - Show the create user form page
router.get("/usuarios/novo", middleware.isAdmin, function(req, res) {
    res.render("admin/users/new");
});

// CREATE - Add new user to db
router.post("/usuarios", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function(req, res) {
    var newUser = new User({
        username: req.body.username,
        email: req.body.email
    });
    if (req.body.adminCode === 'P@ssw0rd') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            req.flash("success", `Usuário "${user.username}" criado.`);
            res.redirect("/admin/usuarios");
        }
    });
});

// DESTROY - Delete user
router.delete("/usuarios/:id", middleware.isAdmin, function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            user.remove();
            req.flash("success", `Usuário "${user.username}" foi removido.`);
            res.redirect("/admin/usuarios");
        }
    });
});

module.exports = router;
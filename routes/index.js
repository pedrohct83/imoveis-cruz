// Require dependencies
var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    User = require("../models/user");

// ROOT - Show landing page
router.get("/", function(req, res) {
    res.render("landing");
});

// REGISTER - Show register form
router.get("/registrar", function(req, res) {
    res.render("register");
});

// REGISTER - Handle register logic
router.post("/registrar",  bodyParser.urlencoded({extended: true}), function(req, res) {
    var newUser = new User({
        username: req.body.username,
        email: req.body.email
    });
    if (req.body.adminCode === 'P@ssw0rd') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register", { error: err.message });
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/imoveis");
        });
    });
});

// LOGIN - Show login form
router.get("/entrar", function(req, res) {
    res.render("login", {page: 'login'});
});

// LOGIN - Handle login logic
router.post("/entrar", bodyParser.urlencoded({ extended: true }), passport.authenticate("local", 
    {
        successRedirect: "/imoveis", 
        failureRedirect: "/entrar"
    }), function(req, res) {
});

// LOGOUT - Log user out
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;
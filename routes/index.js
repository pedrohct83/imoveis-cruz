var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    passport = require("passport");



// Show landing page
router.get("/", function(req, res) {
    res.render("landing");
});



// Show login form
router.get("/entrar", function(req, res) {
    res.render("login", {page: 'login'});
});



// Handle login logic - Authenticate user using passport local strategy
router.post("/entrar", bodyParser.urlencoded({ extended: true }), passport.authenticate("local", 
    {successRedirect: "/imoveis", failureRedirect: "/entrar"}), function(req, res) {
});



// Log user out
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});



module.exports = router;
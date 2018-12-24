// Require dependencies
var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    middleware = require("../middleware/");

// INDEX - Show admin page
router.get("/", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    res.render("admin/index");
});

// USERS - Show users page
router.get("/usuarios", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    User.find().exec(function(err, users) {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("admin/users", { users });
        }
    });
});

module.exports = router;
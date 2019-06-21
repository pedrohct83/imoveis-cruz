// Require dependencies
var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    // Models
    User = require("../models/user"),
    // Middlewares
    middleware = require("../middleware/"),
    // Modules
    handleErrorModRef = require("../modules/handleError");



// Show admin page
router.get("/", middleware.isAdmin, function(req, res) {
    res.render("admin/index");
});



// Show users page
router.get("/usuarios", middleware.isAdmin, function(req, res) {
    // Find all users
    User.find().exec(function(err, users) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.render("admin/users", { users, page: "usuarios" });
        }
    });
});



// Show the create user form page
router.get("/usuarios/novo", middleware.isAdmin, function(req, res) {
    res.render("admin/users/new");
});



// Add new user to db
router.post("/usuarios", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function(req, res) {
    // Create newUser object to be added to the db
    var newUser = new User({
        username: req.body.username,
        email: req.body.email
    });
    
    // Check if admin code is correct, if so set the new user as admin
    if (req.body.adminCode === 'P@ssw0rd') {
        newUser.isAdmin = true;
    }
    
    // Invoke Passport-Local Mongoose to register a new user instance with a given password.
    // It also checks if username is unique.
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            req.flash("success", `Usuário "${user.username}" criado.`);
            res.redirect("/admin/usuarios");
        }
    });
});



// Delete user
router.delete("/usuarios/:id", middleware.isAdmin, function(req, res) {
    // Find and remove user
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            req.flash("success", `Usuário "${user.username}" foi removido.`);
            res.redirect("/admin/usuarios");
        }
    });
});



module.exports = router;
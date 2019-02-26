var express = require("express"),
    router = express.Router(),
    Realty = require("../models/realty"),
    middleware = require("../middleware/");

// INDEX - Show dashboard page
router.get("/", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    Realty.find().exec(function(err, allRealty) {
        if (err) {
            console.log(err);
        }
        else {
            Realty.find({ isRented: "Sim" }).exec(function(err, occupiedRealty) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                }
                else {
                    res.render("dashboard/index", { allRealty, occupiedRealty });
                }
            });
        }
    });
});

module.exports = router;
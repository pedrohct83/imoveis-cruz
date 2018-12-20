var express = require("express"),
    router = express.Router(),
    Tenant = require("../models/tenant"),
    middleware = require("../middleware");

// INDEX - Show all realty
router.get("/", middleware.isLoggedIn, function(req, res) {
    Tenant.find().exec(function(err, tenants) {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("tenants/index", { tenants, page: "inquilinos" });
        }
    });
});

module.exports = router;
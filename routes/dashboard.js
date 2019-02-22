var express = require("express"),
    router = express.Router(),
    middleware = require("../middleware/");

// INDEX - Show dashboard page
router.get("/", middleware.isLoggedIn, middleware.isAdmin, function(req, res) {
    res.render("dashboard/index");
});

module.exports = router;
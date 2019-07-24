var express = require("express"),
    router = express.Router();
    
// Show ´others´ page
router.get("/", function(req, res) {
    res.render("others/index", {
        page: "extras"
    });
});

module.exports = router;
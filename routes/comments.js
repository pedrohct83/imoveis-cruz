var express = require("express"),
    router = express.Router({ mergeParams: true }),
    bodyParser = require("body-parser"),
    Realty = require("../models/realty"),
    Comment = require("../models/comment"),
    middleware = require("../middleware"),
    handleErrorModRef = require("../modules/handleError");



// Create comment
router.post("/", middleware.isLoggedIn, bodyParser.urlencoded({ extended: true }), function(req, res) {
    // Find realty associated with this comment
    Realty.findById(req.params.id, function(err, realty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            // Add comment to db
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    // Set comment author fields and save the comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    
                    // Insert comment into realty.comments array, then save the realty
                    realty.comments.push(comment);
                    realty.save();
                    
                    res.redirect("/imoveis/" + realty._id);
                }
            });
        }
    });
});



// Show the comment edit page
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    // Find realty associated with the comment
    Realty.findById(req.params.id, function(err, realty) {
        if(err || !realty) {handleErrorModRef.handleError(err, res)} else {
            // Find the comment
            Comment.findById(req.params.comment_id, function(err, comment) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    res.render("comments/edit", { realtyId: req.params.id, comment });
                }
            });
        }
    });
});



// Update comment
router.put("/:comment_id", middleware.checkCommentOwnership, bodyParser.urlencoded({ extended: true }), function(req, res) {
    // Find and update comment
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.redirect("/imoveis/" + req.params.id);
        }
    });
});



// Delete comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    // Find and delete comment
    Comment.findByIdAndDelete(req.params.comment_id, function(err) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            req.flash("success", "Comentário removido");
            res.redirect("/imoveis/" + req.params.id);
        }
    });
});



module.exports = router;
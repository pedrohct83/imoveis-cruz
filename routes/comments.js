var express = require("express"),
    router = express.Router({ mergeParams: true }),
    bodyParser = require("body-parser"),
    Realty = require("../models/realty"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");

// CREATE
router.post("/", middleware.isLoggedIn, bodyParser.urlencoded({ extended: true }), function(req, res) {
    Realty.findById(req.params.id, function(err, realty) {
        if (err) {
            console.log(err);
            res.redirect("back");
        }
        else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("error", "Erro ao criar comentário");
                    console.log(err);
                }
                else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    realty.comments.push(comment);
                    realty.save();
                    res.redirect("/imoveis/" + realty._id);
                }
            });
        }
    });
});

// EDIT PAGE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Realty.findById(req.params.id, function(err, realty) {
        if (err || !realty) {
            req.flash("error", "Imóvel não encontrado");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, comment) {
            if (err) {
                res.redirect("back");
            }
            else {
                res.render("comments/edit", { realtyId: req.params.id, comment });
            }
        });
    });
});

// UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, bodyParser.urlencoded({ extended: true }), function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment) {
        if (err) {
            res.redirect("back");
        }
        else {
            res.redirect("/imoveis/" + req.params.id);
        }
    });
});

// DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        }
        else {
            console.log('delete route');
            req.flash("success", "Comentário removido");
            res.redirect("/imoveis/" + req.params.id);
        }
    });
});

module.exports = router;
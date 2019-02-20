var express = require("express"),
    router = express.Router({mergeParams: true}),
    bodyParser = require("body-parser"),
    Realty = require("../models/realty"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");

// Comments new
// router.get("/new", middleware.isLoggedIn, function(req, res) {
//     Campground.findById(req.params.id, function(err, campground) {
//       if(err){
//           console.log(err);
//       } else {
//           res.render("comments/new", {campground: campground});
//       }
//     });
// });

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

// Comments edit
// router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
//     Campground.findById(req.params.id, function(err, foundCampground){
//         if (err || !foundCampground) {
//             req.flash("error", "No campground found");
//             return res.redirect("back");    
//         }    
//         Comment.findById(req.params.comment_id, function(err,foundComment){
//             if(err){
//                 res.redirect("back");
//             } else {
//                 res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
//             }
//         }); 
//     });
// });

// Comments update
// router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
//   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
//       if(err){
//           res.redirect("back");
//       } else {
//           res.redirect("/campgrounds/" + req.params.id);
//       }
//   }); 
// });

// Comment destroy
// router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
//   Comment.findByIdAndRemove(req.params.comment_id, function(err){
//       if(err) {
//           res.redirect("back");
//       } else {
//           req.flash("success", "Comment deleted");
//           res.redirect("/campgrounds/" + req.params.id);
//       }
//   });
// });

module.exports = router;
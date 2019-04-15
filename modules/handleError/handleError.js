module.exports.handleError = function (err, res) {
    console.log(err);
    res.redirect("back");
};
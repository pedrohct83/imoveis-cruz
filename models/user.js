var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

// Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password
// and the salt value.
var UserSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: String,
    isAdmin: {type: Boolean, default: false}
});

// Plugin Passport-Local Mongoose into User schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
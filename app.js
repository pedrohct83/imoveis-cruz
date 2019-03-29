// Require dependencies
var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    session = require("express-session"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User = require("./models/user"),
    backup = require('mongodb-backup'),
    favicon = require("serve-favicon");

// Require and create route variables
var indexRoutes = require("./routes/index"),
    realtyRoutes = require("./routes/realty"),
    tenantRoutes = require("./routes/tenants"),
    adminRoutes = require("./routes/admin"),
    dashboardRoutes = require("./routes/dashboard"),
    commentRoutes = require("./routes/comments");

// Set EJS as the view engine
app.set("view engine", "ejs");

// Set "public" as the static directory
app.use(express.static(__dirname + "/public"));

// Set the favicon path
app.use(favicon(__dirname + '/public/img/favicon.png'));

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Set mongoose connection url
var url = process.env.DATABASEURL || "mongodb://localhost:27017/imoveis";
mongoose.connect(url, {useNewUrlParser: true});

// Config mongodb backup
backup({
   uri: process.env.DATABASEURL || "mongodb://localhost:27017/imoveis",
   root: __dirname + "/mongodb-backup",
   callback: function(err) {
       if(err) {
           console.error(err);
       } else {
           console.log("MongoDB backup finished");
       }
   }
});

// Require moment
app.locals.moment = require("moment");

// Set moment locale
app.locals.moment.locale('pt-br');

// Create session middleware
app.use(session({
    secret: "P@ssw0rd",
    resave: false,
    saveUninitialized: false
}));

// Use flash to display system messages
app.use(flash());

// Use and configure passport with a local strategy
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set local variables
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Set local variables that persist through requests
app.locals.realtyTypes = ["Apartamento", "Garagem", "Loja", "Pavimento", "Sala", "Terreno"];
app.locals.realtyOwners = ["Cruz", "Agro", "MPN"];

// Run DB scripts

// Link route variables with app routes
app.use("/", indexRoutes);
app.use("/imoveis", realtyRoutes);
app.use("/inquilinos", tenantRoutes);
app.use("/admin", adminRoutes);
app.use("/visao-geral", dashboardRoutes);
app.use("/imoveis/:id/comments", commentRoutes);

// Binds and listens for connections on the specified host and port
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("App server has started");
});
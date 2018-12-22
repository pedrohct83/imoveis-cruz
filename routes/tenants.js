var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    Tenant = require("../models/tenant"),
    middleware = require("../middleware");

// INDEX - Show all tenants
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

// NEW - Show the create tenant form page
router.get("/novo", middleware.isLoggedIn, function(req, res) {
    res.render("tenants/new");
});

// CREATE - Add new tenant to db
router.post("/", middleware.isLoggedIn, bodyParser.urlencoded({ extended: true }), function(req, res) {
    var newTenant = {
        name: req.body.name,
        type: req.body.type,
        idNum: req.body.idNum,
        contactName: req.body.contactName,
        contactNum: req.body.contactNum,
        notes: req.body.notes
    };
    try {
        Tenant.create(newTenant);
        req.flash("success", "Novo inquilino adicionado");
        res.redirect("/inquilinos");
    } catch(err) {
        req.flash("error", `Erro ao adicionar novo inquilino: ${err.message}`);
    }
});

// DESTROY - Delete tenant
router.delete("/:id", function(req, res) {
    Tenant.findByIdAndRemove(req.params.id, function(err, tenant) {
        if (err) {
            console.log(err);
            res.redirect("/inquilinos");
        }
        else {
            tenant.remove();
            req.flash("success", `Inquilino "${tenant.name}" foi removido.`);
            res.redirect("/inquilinos");
        }
    });
});

module.exports = router;
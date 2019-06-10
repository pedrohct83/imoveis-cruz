var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    // Models
    Tenant = require("../models/tenant"),
    // Middlewares
    middleware = require("../middleware"),
    // Modules
    handleErrorModRef = require("../modules/handleError");



// Index - Show all tenants
router.get("/", middleware.isLoggedIn, function(req, res) {
    // Query vars
    var search = req.query.search,
        query = {};
        
    // If there's a search query, quote it and prepare 'query.$text' object
    // 'diactricSensitive' set as false so ignore accents and cedillas when searching
    if(search) {
        let searchQuoted = `\"${search}\"`;
        query.$text = {$search: searchQuoted, $diacriticSensitive: false};
    }
    
    // Find tenants filtered by 'query'
    Tenant.find(query).exec(function(err, searchTenants) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.render("tenants/index", {
                tenants: searchTenants,
                page: "inquilinos",
                search: search || ""
            });
        }
    });
});



// NEW - Show the create tenant form page
router.get("/novo", middleware.isAdmin, function(req, res) {
    res.render("tenants/new");
});



// CREATE - Add new tenant to db
router.post("/", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function(req, res) {
    var newTenant = {
        name: req.body.name,
        type: req.body.type,
        cpf: req.body.cpf,
        cnpj: req.body.cnpj,
        contactName: req.body.contactName,
        contactEmail: req.body.contactEmail,
        notes: req.body.notes,
        realty: []
    };
    try {
        Tenant.create(newTenant);
        req.flash("success", "Novo inquilino adicionado");
        res.redirect("/inquilinos");
    } catch(err) {
        req.flash("error", `Erro ao adicionar inquilino: ${err.message}`);
    }
});



// EDIT - Show the edit tenant form page
router.get("/:id/edit", middleware.isAdmin, function(req, res) {
    Tenant.findById(req.params.id, function(err, tenant){
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.render("tenants/edit", { tenant });
        }
    });
});



// UPDATE - Update tenant
router.put("/:id", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function (req, res) {
    (req.body.tenant.type === "Pessoa Física") ? req.body.tenant.cnpj = "" : req.body.tenant.cpf = "";
    Tenant.findByIdAndUpdate(req.params.id, req.body.tenant, function(err, tenant) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.redirect("/inquilinos");
        }
    });  
});



// DESTROY - Delete tenant
router.delete("/:id", middleware.isAdmin, function(req, res) {
    Tenant.findByIdAndRemove(req.params.id, function(err, tenant) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            tenant.remove();
            req.flash("success", `Inquilino "${tenant.name}" foi removido.`);
            res.redirect("/inquilinos");
        }
    });
});



module.exports = router;
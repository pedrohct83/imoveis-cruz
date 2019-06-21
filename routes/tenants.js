var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    // Models
    Tenant = require("../models/tenant"),
    Realty = require("../models/realty"),
    // Middlewares
    middleware = require("../middleware"),
    // Modules
    handleErrorModRef = require("../modules/handleError");



// Show all tenants
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
    Tenant.find(query)
    // Sort the result by name (a-z) and use a collation on the next stage to consider numeric ordering
    .sort({ name: 1 }).collation({locale: "pt", numericOrdering: true})
    .populate("realty").exec(function(err, searchTenants) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.render("tenants/index", {
                tenants: searchTenants,
                page: "inquilinos",
                search: search || ""
            });
        }
    });
});



// Show the create tenant form page
router.get("/novo", middleware.isAdmin, function(req, res) {
    res.render("tenants/new");
});



// Add new tenant to db
router.post("/", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function(req, res) {
    // Create 'newTenant' object that will be added to the db
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
    
    // Try to add new tenant to db and if throws exception, catch the error
    try {
        Tenant.create(newTenant);
        req.flash("success", "Novo inquilino adicionado");
        res.redirect("/inquilinos");
    } catch(err) {
        req.flash("error", `Erro ao adicionar inquilino: ${err.message}`);
    }
});



// Show the edit tenant form page
router.get("/:id/edit", middleware.isAdmin, function(req, res) {
    // Find tenant
    Tenant.findById(req.params.id, function(err, tenant){
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.render("tenants/edit", { tenant });
        }
    });
});



// Update tenant
router.put("/:id", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function (req, res) {
    // Init 'req.body.tenant.cnpj' or 'req.body.tenant.cpf' depending on user choice
    (req.body.tenant.type === "Pessoa Física") ? req.body.tenant.cnpj = "" : req.body.tenant.cpf = "";
    
    // Find tenant and update
    Tenant.findByIdAndUpdate(req.params.id, req.body.tenant, function(err, tenant) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            // Update tenant name and notes fields in every realty that has this 'tenant'
            Realty.updateMany(
                {"tenant.id": tenant.id},
                {$set: {"tenant.name": req.body.tenant.name}, "tenant.notes": req.body.tenant.notes}
            ).exec(function(err) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    res.redirect("/inquilinos");
                } 
            });
        }
    });  
});



// Delete tenant
router.delete("/:id", middleware.isAdmin, function(req, res) {
    // Find and remove tenant
    Tenant.findByIdAndRemove(req.params.id, function(err, tenant) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            // Reset tenant related fields in every realty that has this tenant
            Realty.updateMany(
                {"tenant.id": tenant.id},
                {$set: {
                    tenant: {},
                    isFamily: false,
                    isRented: false,
                    contractStart: null,
                    contractEnd: null,
                    rentValue: 0
                }}
            ).exec(function(err) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    req.flash("success", `Inquilino "${tenant.name}" foi removido.`);
                    res.redirect("/inquilinos");
                } 
            });
        }
    });
});



module.exports = router;
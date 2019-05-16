var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    Tenant = require("../models/tenant"),
    Realty = require("../models/realty"),
    middleware = require("../middleware"),
    handleErrorModRef = require("../modules/handleError");

// INDEX - Show all tenants
router.get("/", middleware.isLoggedIn, function(req, res) {
    Tenant.find().exec(function(err, allTenants) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            var searchQuery = req.query.searchQuery,
                query = {};
            if(searchQuery) {
                let searchQueryQuoted = `\"${searchQuery}\"`;
                query.$text = {$search: searchQueryQuoted, $diacriticSensitive: false};
            }
            Tenant.find(query).exec(function(err, searchTenants) {
                
                
                
                // CONSOLE.LOG RETORNA ARRAYS VAZIOS! QUEREMOS OS REALTIES PRA MOSTRAR NA TABELA DE INQUILINOS (TB TENTEI COM EL.ID, QUE É O IDEAL)
                searchTenants.forEach(function(el, index) {
                    Realty.find({type: "Apartamento"}).exec(function(err, realty) {
                        if(err) {handleErrorModRef.handleError(err, res)} else {
                            console.log(realty);
                        }
                    });
                });
                
                
                
                
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    res.render("tenants/index", {
                        allTenants,
                        tenants: searchTenants,
                        page: "inquilinos",
                        searchQuery: searchQuery || ""
                    });
                }
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
        notes: req.body.notes
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
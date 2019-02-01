var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    Realty = require("../models/realty"),
    Tenant = require("../models/tenant"),
    middleware = require("../middleware");

// INDEX - Show all realty
router.get("/", middleware.isLoggedIn, function(req, res) {
    var perPage = 25,
        pageQuery = parseInt(req.query.page, 10),
        pageNumber = pageQuery ? pageQuery : 1,
        typesArray = ["Apartamento", "Armazém", "Casa", "Fundos", "Garagem", "Ilha", "Lanchonete", "Loja", "Pavimento", "Sala", "Sobreloja", "Terreno"],
        sortBy = {};
    if(!req.query.type) {
        req.query.type = typesArray;
    }
    switch(req.query.sortBy) {
        case "1": sortBy.name = 1; break;
        case "2": sortBy.name = -1; break;
        case "3": sortBy.type = 1; break;
        case "4": sortBy.type = -1; break;
        case "5": sortBy.rentValue = 1; break;
        case "6": sortBy.rentValue = -1; break;
        case "7": sortBy.condominiumValue = 1; break;
        case "8": sortBy.condominiumValue = -1; break;
        default: sortBy.isRented = -1;
    }
    Realty.find().exec(function(err, allRealty) {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {           
            Realty.find({type: {$in: req.query.type}})
            .sort(sortBy)
            .skip((perPage * pageNumber) - perPage)
            .limit(perPage)
            .exec(function(err, realty) {
                if(err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    Realty.count().exec(function (err, count) {
                        if(err) {
                            console.log(err);
                        } else {
                            res.render("realty/index", {
                                allRealty,
                                realty,
                                page: "imoveis",
                                current: pageNumber,
                                pages: Math.ceil(count / perPage),
                                typesArray: typesArray,
                                selectedTypesArray: req.query.type,
                                sortBy: req.query.sortBy
                            });
                        }
                    });
                }
            });
        }
    });
});

// NEW - Show the create realty form page
router.get("/novo", middleware.isLoggedIn, function(req, res) {
    Tenant.find().exec(function(err, tenants) {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("realty/new", { tenants });
        }
    });
});

// SHOW - Go to a realty page
router.get("/:id", middleware.isLoggedIn, function(req, res) {
    Realty.findById(req.params.id).exec(function(err, realty) {
        if (err || !realty) {
            req.flash("error", "Imóvel não encontrado");
            res.redirect("/imoveis");
        } else {
            Tenant.findById(realty.tenant.id).exec(function(err, tenant) {
                if(err) {
                    console.log(err);
                    res.redirect("/imoveis");
                } else {
                    res.render("realty/show", { realty, tenant });
                }
            });
        } 
    });
});
    
// CREATE - Add new realty to db
router.post("/", middleware.isLoggedIn, bodyParser.urlencoded({ extended: true }), function(req, res) {
    var newRealty = {
        name: req.body.name,
        type: req.body.type,
        owner: req.body.owner,
        location: req.body.location,
        mapIframe: req.body.mapIframe,
        areaSize: req.body.areaSize,
        fiscalNum: req.body.fiscalNum,
        isUnappropriate: req.body.isUnappropriate,
        isRented: req.body.isRented,
        contractStart: req.body.contractStart || null,
        contractEnd: req.body.contractEnd || null,
        rentValue: req.body.rentValue || 0,
        condominiumValue: req.body.condominiumValue || 0,
        notes: req.body.notes
    };
    if(req.body.isRented === "Sim" && req.body.tenantId) {
        Tenant.findById(req.body.tenantId, function(err, tenant) {
            if (err || !tenant) {
                req.flash("error", "Inquilino não encontrado");
                res.redirect("/imoveis/novo");
            }
            else {
                newRealty.tenant = {
                    id: tenant._id,
                    name: tenant.name,
                    notes: tenant.notes
                };
                Realty.create(newRealty);
                req.flash("success", "Novo imóvel adicionado");
                res.redirect("/imoveis");
            }
        });
    } else {
        newRealty.contractStart = null;
        newRealty.contractEnd = null;
        newRealty.rentValue = 0;
        Realty.create(newRealty);
        req.flash("success", "Novo imóvel adicionado");
        res.redirect("/imoveis");
    }
});

// EDIT - Show the edit realty form page
router.get("/:id/edit", middleware.isLoggedIn, function(req, res) {
    Realty.findById(req.params.id, function(err, realty){
        if (err) {
            console.log(err);
        } else {
            Tenant.find().exec(function(err, tenants) {
                if(err) {
                    console.log(err);
                    res.redirect("/imoveis");
                } else {
                    res.render("realty/edit", { realty, tenants });
                }
            });
        }
    });
});

// UPDATE - Update realty
router.put("/:id", middleware.isLoggedIn, bodyParser.urlencoded({ extended: true }), function (req, res) {
    if(req.body.realty.isRented == "Não") {
        req.body.realty.tenant = {};
        Realty.findByIdAndUpdate(req.params.id, req.body.realty, function(err, realty) {
            if(err) {
                console.log(err);
                res.redirect("/imoveis");
            } else {
                res.redirect("/imoveis/" + req.params.id);
            }
        });
    } else {
        Tenant.findById(req.body.realty.tenantId, function(err, tenant) {
            if(err) {
                console.log(err);
                res.redirect("/imoveis");
            } else {
                req.body.realty.tenant = {
                    id: req.body.realty.tenantId,
                    name: tenant.name
                };
                Realty.findByIdAndUpdate(req.params.id, req.body.realty, function(err, realty) {
                    if(err) {
                        console.log(err);
                        res.redirect("/imoveis");
                    } else {
                        res.redirect("/imoveis/" + req.params.id);
                    }
                });
            }
        });   
    }
});

// DESTROY - Delete realty
router.delete("/:id", middleware.isAdmin, function(req, res) {
    Realty.findByIdAndRemove(req.params.id, function(err, realty) {
        if (err) {
            console.log(err);
            res.redirect("/imoveis");
        }
        else {
            realty.remove();
            req.flash("success", `Imóvel "${realty.name}" foi removido.`);
            res.redirect("/imoveis");
        }
    });
});

module.exports = router;
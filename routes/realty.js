var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    
    // Models
    Realty = require("../models/realty"),
    Tenant = require("../models/tenant"),
    Comment = require("../models/comment"),
    
    // Middlewares
    middleware = require("../middleware"),
    
    // Modules
    handleErrorModRef = require("../modules/handleError"),
    realtyTypeCountModRef = require("../modules/realtyTypeCount");

// INDEX
router.get("/", middleware.isLoggedIn, function(req, res) {
    var perPage = 25,
        pageQuery = parseInt(req.query.page, 10),
        pageNumber = pageQuery ? pageQuery : 1,
        search = req.query.search,
        selectedRealtyTypes = req.query.type,
        selectedRealtyOwners = req.query.owner,
        query = {};
    
    if(!selectedRealtyTypes) {
        selectedRealtyTypes = req.app.locals.realtyTypes;
    } else {
        if(!Array.isArray(selectedRealtyTypes)) {
            selectedRealtyTypes = selectedRealtyTypes.split();
        }
    }
    query.type = {$in: selectedRealtyTypes};
    
    if(!selectedRealtyOwners) {
        selectedRealtyOwners = req.app.locals.realtyOwners;
    } else {
        if(!Array.isArray(selectedRealtyOwners)) {
            selectedRealtyOwners = selectedRealtyOwners.split();
        }
    }
    query.owner = {$in: selectedRealtyOwners};
    
    if(search) {
        let searchQueryQuoted = `\"${search}\"`;
        query.$text = {$search: searchQueryQuoted, $diacriticSensitive: false};
    }
    
    Realty.find(query).exec(function(err, queryRealty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            let realtyTypeCount = realtyTypeCountModRef.realtyTypeCount(queryRealty),
                sort = {};
            
            switch(req.query.sort) {
                // Name A-Z
                case "1": sort.name = 1; break;
                // Name Z-A
                case "2": sort.name = -1; break;
                // Type A-Z
                case "3": sort.type = 1; break;
                // Type Z-A
                case "4": sort.type = -1; break;
                // Lower rentValue
                case "5": sort.isRented = -1; sort.isFamily = 1; sort.rentValue = 1; sort.name = 1; break;
                // Higher rentValue
                case "6": sort.isRented = -1; sort.rentValue = -1; sort.name = 1; break;
                // Lower condominiumValue
                case "7": sort.condominiumValue = 1; sort.name = 1; break;
                // Higher condominiumValue
                case "8": sort.condominiumValue = -1; sort.name = 1; break;
                // Default
                default: sort.isRented = -1; sort.rentValue = -1; sort.name = 1;
            }
            
            Realty.find(query)
            .sort(sort).collation({locale: "pt", numericOrdering: true})
            .skip((perPage * pageNumber) - perPage)
            .limit(perPage)
            .populate("comments")
            .exec(function(err, querySortSkipLimitRealty) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    Realty.countDocuments(query).exec(function (err, realtyCount) {
                        if(err) {handleErrorModRef.handleError(err, res)} else {
                            res.render("realty/index", {
                                realty: querySortSkipLimitRealty,
                                realtyCount,
                                realtyTypes: req.app.locals.realtyTypes,
                                selectedRealtyTypes,
                                realtyTypeCount,
                                realtyOwners: req.app.locals.realtyOwners,
                                selectedRealtyOwners,
                                page: "imoveis",
                                current: pageNumber,
                                pages: Math.ceil(realtyCount / perPage),
                                perPage,
                                search: req.query.search || "",
                                sort: req.query.sort
                            });
                        }
                    });
                }
            });
        }
    });
});

// NEW
router.get("/novo", middleware.isAdmin, function(req, res) {
    Tenant.find().exec(function(err, tenants) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.render("realty/new", { tenants, typesArray: req.app.locals.realtyTypes });
        }
    });
});

// SHOW
router.get("/:id", middleware.isLoggedIn, function(req, res) {
    Realty.findById(req.params.id).populate("comments").exec(function(err, realty) {
        if(err || !realty) {handleErrorModRef.handleError(err, res)} else {
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
    
// CREATE
router.post("/", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function(req, res) {
    var newRealty = {
        name: req.body.name,
        type: req.body.type,
        owner: req.body.owner,
        location: req.body.location,
        mapIframe: req.body.mapIframe,
        areaSize: req.body.areaSize,
        fiscalNum: req.body.fiscalNum,
        isRented: req.body.isRented,
        contractStart: req.body.contractStart || null,
        contractEnd: req.body.contractEnd || null,
        rentValue: req.body.rentValue || 0,
        condominiumValue: req.body.condominiumValue || 0,
        iptuValue: req.body.iptuValue || 0,
        notes: req.body.notes
    };
    (req.body.isFamily === "on") ? newRealty.isFamily = true : newRealty.isFamily = false;
    if(req.body.isRented === "Sim" && req.body.tenantId) {
        Tenant.findById(req.body.tenantId, function(err, tenant) {
            if(err || !tenant) {handleErrorModRef.handleError(err, res)} else {
                newRealty.tenant = {
                    id: tenant._id,
                    name: tenant.name,
                    notes: tenant.notes
                };
                Realty.create(newRealty, function(err, realty) {
                    if(err) {handleErrorModRef.handleError(err, res)} else {
                        tenant.realty.push(realty);
                        tenant.save();
                        req.flash("success", "Novo imóvel adicionado");
                        res.redirect("/imoveis");
                    }
                });
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

// EDIT
router.get("/:id/edit", middleware.isAdmin, function(req, res) {
    Realty.findById(req.params.id, function(err, realty){
        if(err) {handleErrorModRef.handleError(err, res)} else {
            Tenant.find().exec(function(err, tenants) {
                if(err) {
                    console.log(err);
                    res.redirect("/imoveis");
                } else {
                    res.render("realty/edit", { realty, tenants, typesArray: req.app.locals.realtyTypes });
                }
            });
        }
    });
});

// UPDATE
router.put("/:id", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function (req, res) {
    if(req.body.realty.isRented == "Não") {
        req.body.realty.tenant = {};
        req.body.realty.rentValue = 0;
        req.body.realty.isFamily = false;
        Realty.findByIdAndUpdate(req.params.id, req.body.realty, function(err, realty) {
            if(err) {handleErrorModRef.handleError(err, res)} else {
                res.redirect("/imoveis/" + req.params.id);
            }
        });
    } else {
        Tenant.findById(req.body.realty.tenantId, function(err, tenant) {
            if(err) {handleErrorModRef.handleError(err, res)} else {
                req.body.realty.tenant = {
                    id: req.body.realty.tenantId,
                    name: tenant.name
                };
                (req.body.realty.isFamily === "on") ? req.body.realty.isFamily = true : req.body.realty.isFamily = false;
                Realty.findByIdAndUpdate(req.params.id, req.body.realty, function(err, realty) {
                    if(err) {handleErrorModRef.handleError(err, res)} else {
                        tenant.realty.push(realty);
                        tenant.save();
                        res.redirect("/imoveis/" + req.params.id);
                    }
                });
            }
        });   
    }
});

// DESTROY
router.delete("/:id", middleware.isAdmin, function(req, res) {
    Realty.findByIdAndRemove(req.params.id, function(err, realty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            Comment.remove({"_id": {$in: realty.comments}}, function (err) {
                if(err) {
                    console.log(err);
                    return res.redirect("/imoveis");
                } else {
                    realty.remove();
                    req.flash("success", `Imóvel "${realty.name}" foi removido.`);
                    res.redirect("/imoveis");
                }
            });
        }
    });
});

module.exports = router;
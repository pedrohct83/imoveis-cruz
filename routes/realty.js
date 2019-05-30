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
        pageNumber = pageQuery ? pageQuery : 1;
        
    Realty.find().exec(function(err, allRealty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            var searchQuery = req.query.searchQuery,
                typeQuery = req.query.type,
                ownerQuery = req.query.owner,
                sortBy = {},
                queryObj = {};
                
            switch(req.query.sortBy) {
                // Name A-Z
                case "1": sortBy.name = 1; break;
                // Name Z-A
                case "2": sortBy.name = -1; break;
                // Type A-Z
                case "3": sortBy.type = 1; break;
                // Type Z-A
                case "4": sortBy.type = -1; break;
                // Lower rentValue
                case "5": sortBy.isRented = -1; sortBy.isFamily = 1; sortBy.rentValue = 1; sortBy.name = 1; break;
                // Higher rentValue
                case "6": sortBy.isRented = -1; sortBy.rentValue = -1; sortBy.name = 1; break;
                // Lower condominiumValue
                case "7": sortBy.condominiumValue = 1; sortBy.name = 1; break;
                // Higher condominiumValue
                case "8": sortBy.condominiumValue = -1; sortBy.name = 1; break;
                // Default
                default: sortBy.isRented = -1; sortBy.rentValue = -1; sortBy.name = 1;
            }
            
            if(!typeQuery) {
                typeQuery = req.app.locals.realtyTypes;
            } else {
                if(!Array.isArray(typeQuery)) {
                    typeQuery = typeQuery.split();
                }
            }
            queryObj.type = {$in: typeQuery};
            
            if(!ownerQuery) {
                ownerQuery = req.app.locals.realtyOwners;
            } else {
                if(!Array.isArray(ownerQuery)) {
                    ownerQuery = ownerQuery.split();
                }
            }
            queryObj.owner = {$in: ownerQuery};
            
            if(searchQuery) {
                let searchQueryQuoted = `\"${searchQuery}\"`;
                queryObj.$text = {$search: searchQueryQuoted, $diacriticSensitive: false};
            }
            
            Realty.find(queryObj).exec(function(err, searchRealty) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    var realtyTypeCount = realtyTypeCountModRef.realtyTypeCount(searchRealty);
                    Realty.find(queryObj)
                    .sort(sortBy).collation({locale: "pt", numericOrdering: true})
                    .skip((perPage * pageNumber) - perPage)
                    .limit(perPage)
                    .populate("comments")
                    .exec(function(err, sortSkipLimitRealty) {
                        if(err) {handleErrorModRef.handleError(err, res)} else {
                            Realty.countDocuments(queryObj).exec(function (err, count) {
                                if(err) {handleErrorModRef.handleError(err, res)} else {
                                    res.render("realty/index", {
                                        allRealty,
                                        realty: sortSkipLimitRealty,
                                        page: "imoveis",
                                        current: pageNumber,
                                        pages: Math.ceil(count / perPage),
                                        perPage: perPage,
                                        count: count,
                                        typesArray: req.app.locals.realtyTypes,
                                        ownersArray: req.app.locals.realtyOwners,
                                        selectedTypesArray: typeQuery,
                                        selectedOwnersArray: ownerQuery,
                                        sortBy: req.query.sortBy,
                                        searchQuery: queryObj.searchQuery || "",
                                        ownerQuery: ownerQuery,
                                        realtyTypeCount
                                    });
                                }
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
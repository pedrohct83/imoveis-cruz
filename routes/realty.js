var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    Realty = require("../models/realty"),
    Tenant = require("../models/tenant"),
    Comment = require("../models/comment"),
    middleware = require("../middleware"),
    prepareQueryModRef = require("../modules/prepareQuery");

// INDEX - Show all realty
router.get("/", middleware.isLoggedIn, function(req, res) {
    var perPage = 25,
        pageQuery = parseInt(req.query.page, 10),
        pageNumber = pageQuery ? pageQuery : 1;
    var queryObj = prepareQueryModRef.prepareQuery(req);
    Realty.find().exec(function(err, allRealty) {
        if(err) {handleError(err, res)} else {
            Realty.find(queryObj.findObj).exec(function(err, searchRealty) {
                if(err) {handleError(err, res)} else {
                    let apartamentoCount = 0,
                        garagemCount = 0,
                        lojaCount = 0,
                        pavimentoCount = 0,
                        salaCount = 0,
                        terrenoCount = 0;
                    searchRealty.forEach(function(item) {
                        switch(item.type) {
                            case "Apartamento": apartamentoCount++; break;
                            case "Garagem": garagemCount++; break;
                            case "Loja": lojaCount++; break;
                            case "Pavimento": pavimentoCount++; break;
                            case "Sala": salaCount++; break;
                            case "Terreno": terrenoCount++; break;
                            default: break;
                        }
                    });
                    Realty.find(queryObj.findObj)
                    .sort(queryObj.sortBy).collation({locale: "pt", numericOrdering: true})
                    .skip((perPage * pageNumber) - perPage)
                    .limit(perPage)
                    .populate("comments")
                    .exec(function(err, sortSkipLimitRealty) {
                        if(err) {handleError(err, res)} else {
                            Realty.countDocuments(queryObj.findObj).exec(function (err, count) {
                                if(err) {handleError(err, res)} else {
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
                                        selectedTypesArray: queryObj.typeQuery,
                                        selectedOwnersArray: queryObj.ownerQuery,
                                        sortBy: req.query.sortBy,
                                        searchQuery: queryObj.searchQuery || "",
                                        apartamentoCount, garagemCount, lojaCount, pavimentoCount, salaCount, terrenoCount
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

// NEW - Show the create realty form page
router.get("/novo", middleware.isAdmin, function(req, res) {
    Tenant.find().exec(function(err, tenants) {
        if(err) {handleError(err, res)} else {
            res.render("realty/new", { tenants, typesArray: req.app.locals.realtyTypes });
        }
    });
});

// SHOW - Show more info about a realty
router.get("/:id", middleware.isLoggedIn, function(req, res) {
    Realty.findById(req.params.id).populate("comments").exec(function(err, realty) {
        if(err || !realty) {handleError(err, res)} else {
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
            if(err || !tenant) {handleError(err, res)} else {
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
router.get("/:id/edit", middleware.isAdmin, function(req, res) {
    Realty.findById(req.params.id, function(err, realty){
        if(err) {handleError(err, res)} else {
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

// UPDATE - Update realty
router.put("/:id", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function (req, res) {
    if(req.body.realty.isRented == "Não") {
        req.body.realty.tenant = {};
        req.body.realty.rentValue = 0;
        req.body.realty.isFamily = false;
        Realty.findByIdAndUpdate(req.params.id, req.body.realty, function(err, realty) {
            if(err) {handleError(err, res)} else {
                res.redirect("/imoveis/" + req.params.id);
            }
        });
    } else {
        Tenant.findById(req.body.realty.tenantId, function(err, tenant) {
            if(err) {handleError(err, res)} else {
                req.body.realty.tenant = {
                    id: req.body.realty.tenantId,
                    name: tenant.name
                };
                (req.body.realty.isFamily === "on") ? req.body.realty.isFamily = true : req.body.realty.isFamily = false;
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
        if(err) {handleError(err, res)} else {
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

function handleError (err, res) {
    console.log(err);
    res.redirect("back");
}

module.exports = router;
var express = require("express"),
    router = express.Router(),
    bodyParser = require("body-parser"),
    Realty = require("../models/realty"),
    Tenant = require("../models/tenant"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");

// INDEX - Show all realty
router.get("/", middleware.isLoggedIn, function(req, res) {
    var perPage = 25,
        pageQuery = parseInt(req.query.page, 10),
        pageNumber = pageQuery ? pageQuery : 1,
        sortBy = {},
        searchQuery = req.query.searchQuery,
        typeQuery = req.query.type,
        regex = null,
        findObj = {};
    if(!typeQuery) {
        typeQuery = req.app.locals.realtyTypesArray;
    } else {
        if(!Array.isArray(typeQuery)) {
            typeQuery = typeQuery.split();
        }
    }
    if(searchQuery) {
        regex = new RegExp(escapeRegex(searchQuery), 'gi');
        findObj.type = {$in: typeQuery};
        searchQuery = `\"${searchQuery}\"`;
        findObj.$text = {$search: searchQuery, $diacriticSensitive: false};
    } else {
        findObj.type = {$in: typeQuery};
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
        default: sortBy.rentValue = -1;
    }
    Realty.find().exec(function(err, allRealty) {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            Realty.find(findObj)
            .sort(sortBy)
            .skip((perPage * pageNumber) - perPage)
            .limit(perPage)
            .populate("comments")
            .exec(function(err, realty) {
                if(err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    Realty.countDocuments(findObj).exec(function (err, count) {
                        if(err) {
                            console.log(err);
                        } else {
                            res.render("realty/index", {
                                allRealty,
                                realty,
                                page: "imoveis",
                                current: pageNumber,
                                pages: Math.ceil(count / perPage),
                                perPage: perPage,
                                count: count,
                                typesArray: req.app.locals.realtyTypesArray,
                                selectedTypesArray: typeQuery,
                                sortBy: req.query.sortBy,
                                searchQuery: searchQuery || ""
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
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("realty/new", { tenants, typesArray: req.app.locals.realtyTypesArray });
        }
    });
});

// SHOW - Show more info about a realty
router.get("/:id", middleware.isLoggedIn, function(req, res) {
    Realty.findById(req.params.id).populate("comments").exec(function(err, realty) {
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
router.get("/:id/edit", middleware.isAdmin, function(req, res) {
    Realty.findById(req.params.id, function(err, realty){
        if (err) {
            console.log(err);
        } else {
            Tenant.find().exec(function(err, tenants) {
                if(err) {
                    console.log(err);
                    res.redirect("/imoveis");
                } else {
                    res.render("realty/edit", { realty, tenants, typesArray: req.app.locals.realtyTypesArray });
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
        if (err) {
            console.log(err);
            res.redirect("/imoveis");
        }
        else {
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
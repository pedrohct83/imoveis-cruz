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



// Index: Show all realty
router.get("/", middleware.isLoggedIn, function(req, res) {
    // Pagination vars
    var perPage = 25,
        pageQuery = parseInt(req.query.page, 10),
        pageNumber = pageQuery ? pageQuery : 1,
    // Query vars
        search = req.query.search,
        selectedRealtyTypes = req.query.type,
        selectedRealtyOwners = req.query.owner,
        query = {};
    
    // Prepare 'query.type'
    // If 'selectedRealtyTypes' does not exist, show all types, else, make sure 'selectedRealtyTypes' is an array
    if(!selectedRealtyTypes) {
        selectedRealtyTypes = req.app.locals.realtyTypes;
    } else {
        if(!Array.isArray(selectedRealtyTypes)) {
            selectedRealtyTypes = selectedRealtyTypes.split();
        }
    }
    query.type = {$in: selectedRealtyTypes};
    
    // Prepare 'query.owner'
    // If 'selectedRealtyOwners' does not exist, show all owners, else, make sure 'selectedRealtyOwners' is an array    
    if(!selectedRealtyOwners) {
        selectedRealtyOwners = req.app.locals.realtyOwners;
    } else {
        if(!Array.isArray(selectedRealtyOwners)) {
            selectedRealtyOwners = selectedRealtyOwners.split();
        }
    }
    query.owner = {$in: selectedRealtyOwners};
    
    // Prepare 'query.$text'
    // '$text' performs a text search on the content of the fields indexed with a text index (text: true)
    if(search) {
        let searchQueryQuoted = `\"${search}\"`;
        query.$text = {$search: searchQueryQuoted, $diacriticSensitive: false};
    }
    
    // Find realty filtered by 'query'
    Realty.find(query).exec(function(err, queryRealty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            // Create the 'realtyTypeCount' object.
            // Fields are realty types. Values are realty types cont.
            let realtyTypeCount = realtyTypeCountModRef.realtyTypeCount(queryRealty),
                sort = {};
                
            // Sets the sort order
            // Create sort object field(s) based on user selection
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
            
            // Find realty filtered by query object
            Realty.find(query)
            // Sort the result by sort object and use a collation on the next stage to consider numeric ordering
            .sort(sort).collation({locale: "pt", numericOrdering: true})
            // Skip documents (skip previous pages)
            .skip((perPage * pageNumber) - perPage)
            // Limit, by 'perPage', the number of documents passed to the next stage (ignore next pages)
            .limit(perPage)
            // Populate the 'comments' path with comment documents
            .populate("comments")
            .exec(function(err, querySortSkipLimitRealty) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    // Returns the count of docs that match the query
                    Realty.countDocuments(query).exec(function (err, realtyCount) {
                        if(err) {handleErrorModRef.handleError(err, res)} else {
                            res.render("realty/index", {
                                // Realty vars
                                realty: querySortSkipLimitRealty,
                                realtyCount,
                                realtyTypes: req.app.locals.realtyTypes,
                                selectedRealtyTypes,
                                realtyTypeCount,
                                realtyOwners: req.app.locals.realtyOwners,
                                selectedRealtyOwners,
                                // Page var
                                page: "imoveis",
                                // Pagination vars
                                current: pageNumber,
                                pages: Math.ceil(realtyCount / perPage),
                                perPage,
                                // Query vars
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



// New: Show new realty form page
router.get("/novo", middleware.isAdmin, function(req, res) {
    // Find tenants
    Tenant.find().exec(function(err, tenants) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            res.render("realty/new", { tenants, realtyTypes: req.app.locals.realtyTypes });
        }
    });
});



// Show: Show realty page
router.get("/:id", middleware.isLoggedIn, function(req, res) {
    // Find a realty by id
    Realty.findById(req.params.id)
    // Populate 'comments' path with comment documents
    .populate("comments")
    .exec(function(err, realty) {
        if(err || !realty) {handleErrorModRef.handleError(err, res)} else {
            // Find the tenant that rents this realty
            Tenant.findById(realty.tenant.id).exec(function(err, tenant) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    res.render("realty/show", { realty, tenant });
                }
            });
        } 
    });
});
 
 
    
// Create: Add new realty to db
router.post("/", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function(req, res) {
    // Create 'newRealty' object for realty that will be added to the db
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
    
    // Add 'isFamily' field to 'newRealty'
    (req.body.isFamily === "on") ? newRealty.isFamily = true : newRealty.isFamily = false;
    
    // Add rent related fields depending on 'isRented' boolean
    if(req.body.isRented === "Sim" && req.body.tenantId) {
        // Find tenant chosen by the user
        Tenant.findById(req.body.tenantId, function(err, tenant) {
            if(err || !tenant) {handleErrorModRef.handleError(err, res)} else {
                // Add tenant related fields to 'newRealty'
                newRealty.tenant = {
                    id: tenant._id,
                    name: tenant.name,
                    notes: tenant.notes
                };
                // Add 'newRealty' to the db
                Realty.create(newRealty, function(err, realty) {
                    if(err) {handleErrorModRef.handleError(err, res)} else {
                        // Push 'realty' object to 'tenant.realty' objects array then save the tenant
                        tenant.realty.push(realty);
                        tenant.save();
                        
                        req.flash("success", "Novo imóvel adicionado");
                        res.redirect("/imoveis");
                    }
                });
            }
        });
    } else {
        // Add 'newRealty' to the db
        Realty.create(newRealty);
        req.flash("success", "Novo imóvel adicionado");
        
        res.redirect("/imoveis");
    }
});



// Edit: Show edit realty form page
router.get("/:id/edit", middleware.isAdmin, function(req, res) {
    // Find the realty that will be edited
    Realty.findById(req.params.id, function(err, realty){
        if(err) {handleErrorModRef.handleError(err, res)} else {
            // Find tenants to populate the tenant form field in the view
            Tenant.find().exec(function(err, tenants) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    res.render("realty/edit", { realty, tenants, realtyTypes: req.app.locals.realtyTypes });
                }
            });
        }
    });
});



// Update: Update realty
router.put("/:id", middleware.isAdmin, bodyParser.urlencoded({ extended: true }), function (req, res) {
    // Find realty using the id request parameter
    Realty.findById(req.params.id, function(err, realty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            // Check if realty has a tenant
            if (realty.tenant.id) {
                // Realty has a tenant
                Tenant.findById(realty.tenant.id, function(err, currentTenant) {
                    if(err) {handleErrorModRef.handleError(err, res)} else {
                        // Remove 'realty' from 'currentTenant.realty'
                        for (var i = 0; i < currentTenant.realty.length; i++){
                            if (currentTenant.realty[i] == realty.id) {
                                currentTenant.realty.splice(i, 1); 
                                // i-- to not skip the next item in the array
                                i--;
                            }
                        }
                        currentTenant.save();
                        
                        // Find the new selected Tenant, so we can populate 'req.body.realty.tenant' fields
                        // Even if the new selected tenant is the same, we still need to update the realty and push it into the newTenant realty array
                        Tenant.findById(req.body.realty.tenantId, function(err, newTenant) {
                            if(err) {handleErrorModRef.handleError(err, res)} else {
                                // Set 'req.body.realty.tenant' fields
                                req.body.realty.tenant = {
                                    id: newTenant.id,
                                    name: newTenant.name,
                                    notes: newTenant.notes
                                };  
                                
                                // Set 'req.body.realty.isFamily' field
                                (req.body.realty.isFamily === "on") ? req.body.realty.isFamily = true : req.body.realty.isFamily = false;
                                
                                // Find and update realty
                                Realty.findByIdAndUpdate(req.params.id, req.body.realty, function(err, updatedRealty) {
                                    if(err) {handleErrorModRef.handleError(err, res)} else {
                                        // Add 'updatedRealty' into 'newTenant' realty array, then save 'newTenant'
                                        newTenant.realty.push(updatedRealty);
                                        newTenant.save();
                                        
                                        res.redirect("/imoveis/" + req.params.id);
                                    }
                                });                            
                            }
                        });
                    }
                });
            }
            else {
                // Find and update realty
                Realty.findByIdAndUpdate(req.params.id, req.body.realty, function(err) {
                    if(err) {handleErrorModRef.handleError(err, res)} else {
                        res.redirect("/imoveis/" + req.params.id);
                    }
                });
            }
        }
    });
});



// Destroy: Delete realty
router.delete("/:id", middleware.isAdmin, function(req, res) {
    // Find realty and remove it from the db
    Realty.findByIdAndRemove(req.params.id, function(err, realty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            // Remove all comment documents which ids are present in realty.comments
            Comment.remove({"_id": {$in: realty.comments}}, function (err) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    req.flash("success", `Imóvel "${realty.name}" foi removido.`);
                    res.redirect("/imoveis");
                }
            });
        }
    });
});



module.exports = router;
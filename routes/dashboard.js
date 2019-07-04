var express = require("express"),
    router = express.Router(),
    // Models
    Realty = require("../models/realty"),
    // Middlewares
    middleware = require("../middleware/"),
    // Modules
    handleErrorModRef = require("../modules/handleError"),
    realtyTypeCountModRef = require("../modules/realtyTypeCount");



// Show dashboard page
router.get("/", middleware.isLoggedIn, function(req, res) {
    // Query vars
    var selectedRealtyTypes = req.query.type,
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
    
    // Find realty filtered by query type and owner
    Realty.find({
        type: query.type,
        owner: query.owner
    }).exec(function(err, realty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            // Find realty filtered by query: isRented, type and owner
            Realty.find({
                isRented: "Sim",
                type: query.type,
                owner: query.owner
            }).exec(function(err, occupiedRealty) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    // Create 'totalCondominium' var.
                    // It stores the sum of all realty types condominium values
                    let totalCondominium = 0;
                    realty.forEach(function(item) {
                        if (item.condominiumValue > 0) {
                            totalCondominium += Number(item.condominiumValue);
                        }
                    });
                    totalCondominium = totalCondominium.toFixed(2);
                    
                    // Get the total condominium value paid by others
                    let totalOccupiedCondominium = 0;
                    occupiedRealty.forEach(function(item) {
                        if (item.condominiumValue != 0) {
                            totalOccupiedCondominium += Number(item.condominiumValue);
                        }
                    });
                    totalOccupiedCondominium = totalOccupiedCondominium.toFixed(2);
                    
                    // Create 'realtyTypeCount' object.
                    // Fields are realty types. Values are realty types count.
                    let realtyTypeCount = realtyTypeCountModRef.realtyTypeCount(realty);
                    
                    res.render("dashboard/index", {
                        // Realty vars
                        realty,
                        occupiedRealty,
                        totalCondominium,
                        totalOccupiedCondominium,
                        realtyTypes: req.app.locals.realtyTypes,
                        realtyOwners: req.app.locals.realtyOwners,
                        selectedRealtyTypes,
                        selectedRealtyOwners,
                        realtyTypeCount,
                        
                        // Page var
                        page: "visao-geral"
                    });
                }
            });
        }
    });
});



module.exports = router;
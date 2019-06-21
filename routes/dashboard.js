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
    Realty.find({ type: query.type, owner: query.owner }).exec(function(err, realty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            
            // Find realty filtered by query: isRented, type and owner
            Realty.find({ isRented: "Sim", type: query.type, owner: query.owner }).exec(function(err, occupiedRealty) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    
                    // Find realty filtered by: isFamily, type and owner
                    Realty.find({ isFamily: true, type: query.type, owner: query.owner }).exec(function(err, familyRealty) {
                        if(err) {handleErrorModRef.handleError(err, res)} else {
                            // % of available and occupied realty
                            let percentageOfAvailableRealty = (((realty.length - occupiedRealty.length) / realty.length) * 100).toFixed(2),
                                percentageOfOccupiedRealty = ((occupiedRealty.length / realty.length) * 100).toFixed(2),
                            // Number and % of occupied realty by family/company
                                occupiedRealtyByFamily = familyRealty.length,
                                percentageOfOccupiedRealtyByFamily = ((familyRealty.length / realty.length) * 100).toFixed(2),
                            // Number and % of occupied realty by everyone else but family/comány
                                occupiedRealtyByOthers = occupiedRealty.length - familyRealty.length,
                                percentageOfOccupiedRealtyByOthers = (percentageOfOccupiedRealty - percentageOfOccupiedRealtyByFamily).toFixed(2);
                                
                            // Get the total rent and IPTU values for all occupied realty
                            let totalRentValue = 0,
                                totalIptuValue = 0;
                            for (let i in occupiedRealty) {
                                totalRentValue += Number(occupiedRealty[i].rentValue);
                                totalIptuValue += Number(occupiedRealty[i].iptuValue);
                            }
                            totalRentValue = totalRentValue.toFixed(2);
                            totalIptuValue = totalIptuValue.toFixed(2);
                            
                            // Get the total condominium value paid by others
                            let totalCondominiumByOthers = 0;
                            occupiedRealty.forEach(function(item) {
                                if (item.condominiumValue != 0) {
                                    totalCondominiumByOthers += Number(item.condominiumValue);
                                }
                            });
                            totalCondominiumByOthers = totalCondominiumByOthers.toFixed(2);
                            
                            // Create 'totalCondominium' var.
                            // It stores the sum of all realty types condominium values
                            let totalCondominium = 0;
                            realty.forEach(function(item) {
                                if (item.condominiumValue > 0) {
                                    totalCondominium += Number(item.condominiumValue);
                                }
                            });
                            totalCondominium = totalCondominium.toFixed(2);
                            
                            // Create 'realtyTypeCount' object.
                            // Fields are realty types. Values are realty types count.
                            let realtyTypeCount = realtyTypeCountModRef.realtyTypeCount(realty);
                            
                            res.render("dashboard/index", {
                                // Realty vars
                                realty,
                                occupiedRealtyByFamily,
                                occupiedRealtyByOthers,
                                percentageOfAvailableRealty,
                                percentageOfOccupiedRealty,
                                percentageOfOccupiedRealtyByFamily,
                                percentageOfOccupiedRealtyByOthers,
                                totalCondominium,
                                totalCondominiumByOthers,
                                totalRentValue,
                                totalIptuValue,
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
        }
    });
});



module.exports = router;
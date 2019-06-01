var express = require("express"),
    router = express.Router(),
    Realty = require("../models/realty"),
    middleware = require("../middleware/"),
    handleErrorModRef = require("../modules/handleError"),
    realtyTypeCountModRef = require("../modules/realtyTypeCount");

// INDEX
router.get("/", middleware.isLoggedIn, function(req, res) {
    var selectedRealtyTypes = req.query.type,
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
    
    
    Realty.find({ type: query.type, owner: query.owner }).exec(function(err, realty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            var realtyTypeCount = realtyTypeCountModRef.realtyTypeCount(realty);
            var totalCondominium = 0;
            realty.forEach(function(item) {
                if (item.condominiumValue != 0) {
                    totalCondominium += Number(item.condominiumValue);
                }
            });
            totalCondominium = totalCondominium.toFixed(2);
            
            Realty.find({ isRented: "Sim", type: query.type, owner: query.owner }).exec(function(err, occupiedRealty) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    let totalCondominiumByOthers = 0;
                    occupiedRealty.forEach(function(item) {
                        if (item.condominiumValue != 0) {
                            totalCondominiumByOthers += Number(item.condominiumValue);
                        }
                    });
                    totalCondominiumByOthers = totalCondominiumByOthers.toFixed(2);
                    
                    Realty.find({ isFamily: true, type: query.type, owner: query.owner }).exec(function(err, familyRealty) {
                        if(err) {handleErrorModRef.handleError(err, res)} else {
                            let occupiedRealtyByFamily = familyRealty.length,
                                occupiedRealtyByOthers = occupiedRealty.length - familyRealty.length,
                                percentageOfAvailableRealty = (((realty.length - occupiedRealty.length) / realty.length) * 100).toFixed(2),
                                percentageOfOccupiedRealty = ((occupiedRealty.length / realty.length) * 100).toFixed(2),
                                percentageOfOccupiedRealtyByFamily = ((familyRealty.length / realty.length) * 100).toFixed(2),
                                percentageOfOccupiedRealtyByOthers = (percentageOfOccupiedRealty - percentageOfOccupiedRealtyByFamily).toFixed(2),
                                totalRentValue = 0,
                                totalIptuValue = 0;
                            for (let i in occupiedRealty) {
                                totalRentValue += Number(occupiedRealty[i].rentValue);
                                totalIptuValue += Number(occupiedRealty[i].iptuValue);
                            }
                            totalRentValue = totalRentValue.toFixed(2);
                            totalIptuValue = totalIptuValue.toFixed(2);
                            
                            res.render("dashboard/index", {
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
                                page: "visao-geral",
                                realtyTypeCount
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
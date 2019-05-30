var express = require("express"),
    router = express.Router(),
    Realty = require("../models/realty"),
    middleware = require("../middleware/"),
    prepareRealtyQueryModRef = require("../modules/prepareRealtyQuery"),
    handleErrorModRef = require("../modules/handleError"),
    realtyTypeCountModRef = require("../modules/realtyTypeCount");

// INDEX
router.get("/", middleware.isLoggedIn, function(req, res) {
    var query = prepareRealtyQueryModRef.prepareRealtyQuery(req);
    Realty.find({ type: { $in: query.typeQuery }, owner: {$in: query.ownerQuery} }).exec(function(err, allRealty) {
        if(err) {handleErrorModRef.handleError(err, res)} else {
            var realtyTypeCount = realtyTypeCountModRef.realtyTypeCount(allRealty);
            var totalCondominium = 0;
            allRealty.forEach(function(item) {
                if (item.condominiumValue != 0) {
                    totalCondominium += Number(item.condominiumValue);
                }
            });
            totalCondominium = totalCondominium.toFixed(2);
            Realty.find({ isRented: "Sim", type: { $in: query.typeQuery }, owner: {$in: query.ownerQuery} }).exec(function(err, occupiedRealty) {
                if(err) {handleErrorModRef.handleError(err, res)} else {
                    let totalCondominiumByOthers = 0;
                    occupiedRealty.forEach(function(item) {
                        if (item.condominiumValue != 0) {
                            totalCondominiumByOthers += Number(item.condominiumValue);
                        }
                    });
                    totalCondominiumByOthers = totalCondominiumByOthers.toFixed(2);
                    Realty.find({ isFamily: true, type: { $in: query.typeQuery }, owner: {$in: query.ownerQuery} }).exec(function(err, familyRealty) {
                        if(err) {handleErrorModRef.handleError(err, res)} else {
                            let occupiedRealtyByFamily = familyRealty.length,
                                occupiedRealtyByOthers = occupiedRealty.length - familyRealty.length,
                                percentageOfAvailableRealty = (((allRealty.length - occupiedRealty.length) / allRealty.length) * 100).toFixed(2),
                                percentageOfOccupiedRealty = ((occupiedRealty.length / allRealty.length) * 100).toFixed(2),
                                percentageOfOccupiedRealtyByFamily = ((familyRealty.length / allRealty.length) * 100).toFixed(2),
                                percentageOfOccupiedRealtyByOthers = (percentageOfOccupiedRealty - percentageOfOccupiedRealtyByFamily).toFixed(2),
                                totalRentValue = 0,
                                totalIptuValue = 0;
                            for (let i in occupiedRealty) {
                                totalRentValue += Number(occupiedRealty[i].rentValue);
                                totalIptuValue += Number(occupiedRealty[i].iptuValue);
                            }
                            totalRentValue = totalRentValue.toFixed(2);
                            totalIptuValue = totalIptuValue.toFixed(2);
                            
                            // Render
                            res.render("dashboard/index", {
                                allRealty,
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
                                allRealtyTypes: req.app.locals.realtyTypes,
                                ownersArray: req.app.locals.realtyOwners,
                                selectedTypesArray: query.typeQuery,
                                selectedTypesString: query.typeQuery.join(", "),
                                selectedOwnersArray: query.ownerQuery,
                                selectedOwnersString: query.ownerQuery.join(", "),
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
var express = require("express"),
    router = express.Router(),
    Realty = require("../models/realty"),
    middleware = require("../middleware/");

// INDEX - Show dashboard page
router.get("/", middleware.isLoggedIn, function(req, res) {
    var typeQuery = req.query.type;
    if (!typeQuery) {
        typeQuery = req.app.locals.realtyTypesArray;
    }
    else {
        if (!Array.isArray(typeQuery)) {
            typeQuery = typeQuery.split();
        }
    }
    Realty.find({ type: { $in: typeQuery } }).exec(function(err, allRealty) {
        if (err) {
            console.log(err);
        }
        else {
            Realty.find({ isRented: "Sim", type: { $in: typeQuery } }).exec(function(err, occupiedRealty) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                }
                else {
                    Realty.find({ isFamily: true, type: { $in: typeQuery } }).exec(function(err, familyRealty) {
                        if (err) {
                            console.log(err);
                            res.redirect("back");
                        }
                        else {
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
                            res.render("dashboard/index", {
                                allRealty,
                                occupiedRealtyByFamily,
                                occupiedRealtyByOthers,
                                percentageOfAvailableRealty,
                                percentageOfOccupiedRealty,
                                percentageOfOccupiedRealtyByFamily,
                                percentageOfOccupiedRealtyByOthers,
                                totalRentValue,
                                totalIptuValue,
                                typesArray: req.app.locals.realtyTypesArray,
                                selectedTypesArray: typeQuery,
                                selectedTypesString: typeQuery.join(", "),
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
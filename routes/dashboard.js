var express = require("express"),
    router = express.Router(),
    Realty = require("../models/realty"),
    middleware = require("../middleware/");

// INDEX - Show dashboard page
router.get("/", middleware.isLoggedIn, function(req, res) {
    var typeQuery = req.query.type;
    if (!typeQuery) {
        typeQuery = req.app.locals.realtyTypes;
    }
    else {
        if (!Array.isArray(typeQuery)) {
            typeQuery = typeQuery.split();
        }
    }
    Realty.find({ type: { $in: typeQuery } }).exec(function(err, allRealty) {
        if(err) {handleError(err, res)} else {
            var totalCondominium = 0;
            let apartamentoCount = 0,
                garagemCount = 0,
                lojaCount = 0,
                pavimentoCount = 0,
                salaCount = 0,
                terrenoCount = 0;
            allRealty.forEach(function(item) {
                if (item.condominiumValue != 0) {
                    totalCondominium += Number(item.condominiumValue);
                }
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
            totalCondominium = totalCondominium.toFixed(2);
            Realty.find({ isRented: "Sim", type: { $in: typeQuery } }).exec(function(err, occupiedRealty) {
                if(err) {handleError(err, res)} else {
                    let totalCondominiumByOthers = 0;
                    occupiedRealty.forEach(function(item) {
                        if (item.condominiumValue != 0) {
                            totalCondominiumByOthers += Number(item.condominiumValue);
                        }
                    });
                    totalCondominiumByOthers = totalCondominiumByOthers.toFixed(2);
                    Realty.find({ isFamily: true, type: { $in: typeQuery } }).exec(function(err, familyRealty) {
                        if(err) {handleError(err, res)} else {
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
                                totalCondominium,
                                totalCondominiumByOthers,
                                totalRentValue,
                                totalIptuValue,
                                typesArray: req.app.locals.realtyTypes,
                                selectedTypesArray: typeQuery,
                                selectedTypesString: typeQuery.join(", "),
                                page: "visao-geral",
                                apartamentoCount, garagemCount, lojaCount, pavimentoCount, salaCount, terrenoCount
                            });
                        }
                    });
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
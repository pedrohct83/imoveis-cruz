module.exports.realtyTypeCount = function (realty) {
    // Declare 'realtyTypeCount' object
    let realtyTypeCount = {
        apartamento: 0,
        garagem: 0,
        loja: 0,
        pavimento: 0,
        sala: 0,
        terreno: 0
    };
    // Run through all realty, check its type and increment its related type field
    realty.forEach(function(item) {
        switch(item.type) {
            case "Apartamento": realtyTypeCount.apartamento++; break;
            case "Garagem": realtyTypeCount.garagem++; break;
            case "Loja": realtyTypeCount.loja++; break;
            case "Pavimento": realtyTypeCount.pavimento++; break;
            case "Sala": realtyTypeCount.sala++; break;
            case "Terreno": realtyTypeCount.terreno++; break;
            default: break;
        }
    });
    return realtyTypeCount;
};
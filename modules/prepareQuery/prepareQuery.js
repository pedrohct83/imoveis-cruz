module.exports.prepareQuery = function (req) {
    var searchQuery = req.query.searchQuery,
        typeQuery = req.query.type,
        ownerQuery = req.query.owner,
        sortBy = {},
        queryObj = {};
    switch(req.query.sortBy) {
        // Name A-Z
        case "1": sortBy.name = 1; break;
        // Name Z-A
        case "2": sortBy.name = -1; break;
        // Type A-Z
        case "3": sortBy.type = 1; break;
        // Type Z-A
        case "4": sortBy.type = -1; break;
        // Lower rentValue
        case "5": sortBy.isRented = -1; sortBy.isFamily = 1; sortBy.rentValue = 1; sortBy.name = 1; break;
        // Higher rentValue
        case "6": sortBy.isRented = -1; sortBy.rentValue = -1; sortBy.name = 1; break;
        // Lower condominiumValue
        case "7": sortBy.condominiumValue = 1; sortBy.name = 1; break;
        // Higher condominiumValue
        case "8": sortBy.condominiumValue = -1; sortBy.name = 1; break;
        // Default
        default: sortBy.isRented = -1; sortBy.rentValue = -1; sortBy.name = 1;
    }
    if(!typeQuery) {
        typeQuery = req.app.locals.realtyTypes;
    } else {
        if(!Array.isArray(typeQuery)) {
            typeQuery = typeQuery.split();
        }
    }
    if(!ownerQuery) {
        ownerQuery = req.app.locals.realtyOwners;
    } else {
        if(!Array.isArray(ownerQuery)) {
            ownerQuery = ownerQuery.split();
        }
    }
    if(searchQuery) {
        queryObj.type = {$in: typeQuery};
        queryObj.owner = {$in: ownerQuery};
        let searchQueryQuoted = `\"${searchQuery}\"`;
        queryObj.$text = {$search: searchQueryQuoted, $diacriticSensitive: false};
    } else {
        queryObj.type = {$in: typeQuery};
        queryObj.owner = {$in: ownerQuery};
    }
    return {
        searchQuery,
        queryObj,
        typeQuery,
        ownerQuery,
        sortBy
    };
};
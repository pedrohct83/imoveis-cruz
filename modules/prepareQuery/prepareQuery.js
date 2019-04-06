module.exports.prepareQuery = function (req) {
    var searchQuery = req.query.searchQuery,
        typeQuery = req.query.type,
        ownerQuery = req.query.owner,
        sortBy = {},
        findObj = {};
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
        findObj.type = {$in: typeQuery};
        findObj.owner = {$in: ownerQuery};
        let searchQueryQuoted = `\"${searchQuery}\"`;
        findObj.$text = {$search: searchQueryQuoted, $diacriticSensitive: false};
    } else {
        findObj.type = {$in: typeQuery};
        findObj.owner = {$in: ownerQuery};
    }
    return {
        searchQuery,
        findObj,
        typeQuery,
        ownerQuery,
        sortBy
    };
};
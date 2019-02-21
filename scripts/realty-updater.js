var Realty = require("../models/realty"),
    Tenant = require("../models/tenant"),
    User = require("../models/user");

async function realtyUpdate(realtyName, realtyProperty, newValue){
    console.log("Executing Realty Updater v1.0\n");
    try {
        let teste = Realty.find({ name: new RegExp(realtyName, 'i') }, { name: 1 });
        console.log(teste.mongooseCollection.name);
    } catch(err) {
        console.log(err);
    }
}

realtyUpdate("Fundos", "condominiumValue", 45);
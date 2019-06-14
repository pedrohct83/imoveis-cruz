var Tenant = require("../models/tenant"),
    mongoose = require("mongoose");

var url = process.env.DATABASEURL || "mongodb://localhost:27017/imoveis";
mongoose.connect(url, { useNewUrlParser: true });

(async () => {
    let promise = await Tenant.find({});
    if (promise.length === 0) {
        console.log("No tenant found");
    } else {
        try {
            promise.forEach(function(tenant) {
                tenant.realty = [];
                tenant.save();
            });
        } catch (err) {
            console.log(err);
        }
    }
})();
var Realty = require("../models/realty");
function test() {
    console.log("in test function");
    Realty.find().exec(function(err, realty) {
        if(err) {
            console.log(err);
        } else {
            console.log("realty found");
        }
    });
}
test();
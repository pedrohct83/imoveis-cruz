var Realty = require("../models/realty"),
    mongoose = require("mongoose");

var url = process.env.DATABASEURL || "mongodb://localhost:27017/imoveis";
mongoose.connect(url, { useNewUrlParser: true });

var myArgs = require('optimist').argv,
    help = 'Realty Updater 1.0\nRun with the flags: -n realty_name -k realty_key -v realty_key_newvalue';

if ((myArgs.h) || (myArgs.help)) {
    console.log(help);
    process.exit(0);
}

if (myArgs.n && myArgs.k && myArgs.v) {
    console.log(`All flags detected: ${myArgs.n} ${myArgs.k} ${myArgs.v}`);
    var realtyName = new RegExp(escapeRegex(myArgs.n), 'gi');
    (async () => {
        let promise = await Realty.find({ name: realtyName });
        if (promise.length === 0) {
            console.log("No realty found with that name");
        } else {
            try {
                console.log(`${promise.length} realty found with the name ${myArgs.n}`);
                promise.forEach(function(realty) {
                   realty[myArgs.k] = myArgs.v;
                   realty.save();
                });
                console.log(`Set the key "${myArgs.k}" with the value ${myArgs.v} for ${promise.length} realty found with the name "${myArgs.n}"`);
            } catch (err) {
                console.log(err);
            }
        }
    })();
} else {
    console.log(help);
    process.exit(0);
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
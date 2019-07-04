var mongoose = require("mongoose");

var realtySchema = new mongoose.Schema({
    // A realty has only one author, which is a user
    // We decided to store only id and username in this realty schema
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    // In order to perform a text search on the content of this field, we had to index it with a text index (text:true)
    name: { type: String, text: true },
    type: String,
    owner: String,
    location: String,
    mapIframe: String,
    createdAt: { type: Date, default: Date.now },
    areaSize: { type: Number, min: 1 },
    fiscalNum: { type: Number, min: 1 },
    // Get and Set calls getPrice and setPrice functions
    // We are storing currency numbers like 123.45 as 1245 (set), but when we get it, we need it as 123.45 (get)
    condominiumValue: {type: Number, get: getPrice, set: setPrice},
    iptuValue: {type: Number, get: getPrice, set: setPrice},
    notes: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    
    // Tenant related fields
    isRented: String,
    tenant: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant"
        },
        name: String,
        notes: String
    },
    contractStart: Date,
    contractEnd: Date,
    rentValue: {type: Number, get: getPrice, set: setPrice}
});

// toFixed(2) converts a number into a string, keeping only two decimals
function getPrice(num){
    return (num/100).toFixed(2);
}

function setPrice(num){
    return num*100;
}

module.exports = mongoose.model("Realty", realtySchema);
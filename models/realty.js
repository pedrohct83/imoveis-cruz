var mongoose = require("mongoose");

var realtySchema = new mongoose.Schema({
    isFamily: Boolean,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    name: { type: String, text: true },
    type: String,
    owner: String,
    location: String,
    mapIframe: String,
    createdAt: { type: Date, default: Date.now },
    areaSize: { type: Number, min: 1 },
    fiscalNum: { type: Number, min: 1 },
    condominiumValue: {type: Number, get: getPrice, set: setPrice},
    iptuValue: {type: Number, get: getPrice, set: setPrice},
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
    rentValue: {type: Number, get: getPrice, set: setPrice},
    notes: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
});

realtySchema.path("name").index({text: true});

function getPrice(num){
    return (num/100).toFixed(2);
}

function setPrice(num){
    return num*100;
}

module.exports = mongoose.model("Realty", realtySchema);
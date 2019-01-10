var mongoose = require("mongoose");

var tenantSchema = new mongoose.Schema({
    name: String,
    type: String,
    idNum: { type: Number, min: 1 },
    contactName: String,
    contactEmail: String,
    contactNum: { type: Number, min: 1 },
    notes: String
});

module.exports = mongoose.model("Tenant", tenantSchema);
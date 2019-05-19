var mongoose = require("mongoose"),
    Realty = require("../models/realty");

var tenantSchema = new mongoose.Schema({
    name: { type: String, text: true },
    type: String,
    cpf: String,
    cnpj: String,
    contactName: String,
    contactEmail: String,
    phone: String,
    notes: String,
    realty: [Realty.schema]
});

module.exports = mongoose.model("Tenant", tenantSchema);
var mongoose = require("mongoose"),
    Realty = require("../models/realty");

var tenantSchema = new mongoose.Schema({
    // In order to perform a text search on the content of this field, we had to index it with a text index (text:true)
    name: { type: String, text: true },
    type: String,
    cpf: String,
    cnpj: String,
    contactName: String,
    contactEmail: String,
    phone: String,
    notes: String,
    // Array of realty object ids
    // By not specifing which fields we need, we can populate a tenant query with its realty
    // This allow us to use realty.any_field in the tenant view
    realty: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Realty"
        }
    ],
});

module.exports = mongoose.model("Tenant", tenantSchema);
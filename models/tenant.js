var mongoose = require("mongoose");

var tenantSchema = new mongoose.Schema({
    name: { type: String, text: true },
    type: String,
    cpf: String,
    cnpj: String,
    contactName: String,
    contactEmail: String,
    phone: String,
    notes: String,
});

module.exports = mongoose.model("Tenant", tenantSchema);
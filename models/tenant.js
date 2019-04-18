var mongoose = require("mongoose");

var tenantSchema = new mongoose.Schema({
    name: String,
    type: String,
    cpf: String,
    cnpj: String,
    contactName: String,
    contactEmail: String,
    phone: String,
    notes: String,
});

tenantSchema.path("name").index({text: true});

module.exports = mongoose.model("Tenant", tenantSchema);
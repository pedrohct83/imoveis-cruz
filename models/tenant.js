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
    
    
    idNum: { type: Number, min: 1 },
    contactNum: { type: Number, min: 1 }
});

module.exports = mongoose.model("Tenant", tenantSchema);
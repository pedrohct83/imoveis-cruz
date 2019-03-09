(function() {
    // Initiate Inputmask
    var Inputmask = require("inputmask");
    Inputmask().mask(document.querySelectorAll("input"));
    
    // Add hide to .collapseFilters on mobile
    var collapseFilters = document.getElementById("collapseFilters");
    if (collapseFilters && document.documentElement.clientWidth >= 992) {
        collapseFilters.classList.remove("hide");
        collapseFilters.classList.add("show");
    }
    
    // Toggle cpf or cnpj field depending on tenant.type choice
    var typeSelector = document.getElementById("type"),
        cpfField = document.getElementsByClassName("cpfField"),
        cnpjField = document.getElementsByClassName("cnpjField");
    if(typeSelector && cpfField.length !== 0 && cnpjField.length !== 0) {
        toggleTypeFields();
        typeSelector.addEventListener("change", toggleTypeFields);  
    }
    function toggleTypeFields() {
        if (typeSelector.value === "Pessoa Física") {
            cnpjField[0].childNodes[3].value = "";
            cpfField[0].classList.remove("d-none");
            cnpjField[0].classList.add("d-none");
        } else {
            cpfField[0].childNodes[3].value = "";
            cnpjField[0].classList.remove("d-none");
            cpfField[0].classList.add("d-none");
        }
    }    
    
    // Toggle tenant form fields on the create realty form
    var isRentedSelector = document.getElementById("isRented");
    var tenantFields = document.getElementsByClassName("tenantField");
    if(isRentedSelector && tenantFields.length !== 0) {
        toggleTenantFields();
        isRentedSelector.addEventListener("change", toggleTenantFields);
    }
    function toggleTenantFields() {
        if(isRentedSelector.value === "Sim") {
            document.getElementById("tenantId").setAttribute("required", "");
            for(let i of tenantFields) {
                i.classList.remove("d-none");
                i.classList.add("d-block");
            }     
        } else {
            document.getElementById("tenantId").removeAttribute("required");
            for(let i of tenantFields) {
                i.classList.remove("d-block");
                i.classList.add("d-none");
            }  
        } 
    }
})();
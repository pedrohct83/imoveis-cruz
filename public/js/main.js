(function() {
    // Initiate Inputmask
    var Inputmask = require("inputmask");
    Inputmask().mask(document.querySelectorAll("input"));
    
    // Add hide to collapseFilters on mobile
    var collapseFilters = document.getElementById("collapseFilters");
    if (collapseFilters && document.documentElement.clientWidth >= 992) {
        collapseFilters.classList.remove("hide");
        collapseFilters.classList.add("show");
    }
    
    // Toggle cpf or cnpj field depending on tenant.type choice
    // var typeSelector = document.getElementById("type"),
    //     typeFieldCPF = document.getElementsByClassName("typeFieldCPF"),
    //     typeFieldCNPJ = document.getElementsByClassName("typeFieldCNPJ");
    // if(typeSelector && typeFieldCPF.length !== 0 && typeFieldCNPJ.length !== 0) {
    //     toggleTypeFields();
    //     typeSelector.addEventListener("change", toggleTypeFields);  
    // }
    // function toggleTypeFields() {
    //     if (typeSelector.value === "Pessoa Física") {
    //         typeFieldCNPJ[0].childNodes[1].value = "";
    //         typeFieldCPF[0].classList.remove("d-none");
    //         typeFieldCNPJ[0].classList.add("d-none");
    //     } else {
    //         typeFieldCPF[0].childNodes[1].value = "";
    //         typeFieldCNPJ[0].classList.remove("d-none");
    //         typeFieldCPF[0].classList.add("d-none");
    //     }
    // }    
    
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
    
    // Toggle sale form fields on the create realty form
    var forSaleSelector = document.getElementById("forSale");
    var forSaleFields = document.getElementsByClassName("forSaleField");
    if(forSaleSelector && forSaleFields.length !== 0) {
        toggleForSaleFields();
        forSaleSelector.addEventListener("change", toggleForSaleFields);
    }
    function toggleForSaleFields() {
        if(forSaleSelector.value === "Sim") {
            for(let i of forSaleFields) {
                i.classList.remove("d-none");
                i.classList.add("d-block");
            }     
        } else {
            for(let i of forSaleFields) {
                i.classList.remove("d-block");
                i.classList.add("d-none");
            }  
        } 
    }
})();
(function() {
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
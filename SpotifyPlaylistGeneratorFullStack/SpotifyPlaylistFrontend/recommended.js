document.getElementById("BackButton").onclick = function() {
    window.location.href = window.location.origin;
}

document.getElementById("SelectAllButton").textContent = "Select All";

document.getElementById("SelectAllButton").onclick = function() {
    let select = (this.textContent == "Select All");
    const items = JSON.parse(localStorage.recommendedItems).recommended;
    for (let i = 1; i <= items; i++) {
        let Recommended = document.getElementById("Recommended"+i);
        Recommended.querySelector("#Check").checked = select;
    }
    
    if (select) {
        this.textContent = "Deselect All";
    }
    else {
        this.textContent = "Select All";
    }
}

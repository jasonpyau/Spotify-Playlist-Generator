import { createSeedsDisplay } from "./formData.js";
import { updateSeedsDisplay } from "./formData.js";

document.addEventListener("DOMContentLoaded", function() { 
    loadData();
});

async function loadData() {
    createSeedsDisplay();
    updateSeedsDisplay(JSON.parse(localStorage.formDataSeeds));
    for (let i = 1; i <= 5; i++) {
        let SeedRemove = document.getElementById("SeedRemove"+i);
        SeedRemove.querySelector("#SeedRemoveCheck").style.display = "none";
    }
    const MainHeader = document.getElementById("MainHeader");
    MainHeader.textContent = JSON.parse(localStorage.recommendedItems).recommended + " Tracks added to Playlist successfully."
    const link = localStorage.playlist;
    const LinkDOM = document.getElementById("Link");
    LinkDOM.href = link;
    LinkDOM.textContent = link;
}

document.getElementById("BackButton").onclick = function() {
    window.location.href = window.location.origin;
}
import { getForms, NumberInputChanged, RemoveButtonClicked, SubmitFormButtonClicked } from "./formData.js";

NumberInput.oninput = function() {
    NumberInputChanged();
}

document.getElementById("RemoveButton").onclick = function() {
    RemoveButtonClicked();
}

document.getElementById("SubmitFormButton").onclick = async function() {
    await SubmitFormButtonClicked()
}

document.addEventListener("DOMContentLoaded", function() { 
    getForms();
});

import { addFormData } from "./formData.js";
import { removeFormData } from "./formData.js";
import { formData } from "./formData.js"

export function MultipleChoice(elementText, elementCode, addTo, type, name) {
    const container = document.createElement("div");
    container.style = "padding-bottom: 5px; ";
    addTo.appendChild(container);

    const MultipleChoice = document.createElement("input");
    MultipleChoice.type = type;
    MultipleChoice.className = "MultipleChoiceInput";
    MultipleChoice.id = elementCode;
    MultipleChoice.name = name;
    MultipleChoice.style = "transform: scale(1.5); padding-right: 5px; "
    MultipleChoice.onclick = async function click() {
        await MultipleChoiceClicked(this);
    };

    const MultipleChoiceText = document.createElement("button");
    MultipleChoiceText.textContent = elementText;
    MultipleChoiceText.name = elementCode;
    MultipleChoiceText.style.padding = "8px";
    MultipleChoiceText.style.fontSize = "15px";
    MultipleChoiceText.style.borderStyle = "none";
    MultipleChoiceText.style.borderRadius = "5px";
    MultipleChoiceText.style.marginLeft = "5px";
    MultipleChoiceText.style.backgroundColor = "#f0f0f0";
    MultipleChoiceText.style.color = "black";
    MultipleChoiceText.style.transition = "background-color .5s"

    MultipleChoiceText.onclick = async function click() {
        await MultipleChoiceTextClicked(this);
    }

    const linebreak = document.createElement("br");

    container.appendChild(MultipleChoice);
    container.appendChild(MultipleChoiceText);
    container.appendChild(linebreak);
}

export async function MultipleChoiceClicked(MultipleChoice) {
    let MultipleChoiceText = document.getElementsByName(MultipleChoice.id)[0];
    const type = MultipleChoice.name+"Input";

    if (MultipleChoice.checked == false && MultipleChoice.type == "checkbox") {
        MultipleChoiceText.style.backgroundColor = "#f0f0f0"; 
        removeFormData(MultipleChoice.id, type, true);
        return;
    }

    const success = await addFormData(MultipleChoice.id, type);

    if (success) {
        MultipleChoiceText.style.backgroundColor = "#54eb89"; 
    }
    else if (MultipleChoice.type == "radio") {
        let oldMultipleChoice = document.getElementById(formData[type].data[0]);
        let oldMultipleChoiceText = document.getElementsByName(oldMultipleChoice.id)[0];
        oldMultipleChoiceText.style.backgroundColor = "#f0f0f0";
        removeFormData(oldMultipleChoice.id, type, true);
        addFormData(MultipleChoice.id, type);
        MultipleChoiceText.backgroundColor = MultipleChoiceText.style.backgroundColor = "#54eb89";
    }
    else {
        MultipleChoice.checked = false;
        MultipleChoiceText.style.backgroundColor = "#ff4d4d";
        setTimeout(function() {
            MultipleChoiceText.style.backgroundColor = "#f0f0f0";
        }, 1000);
    }
}

async function MultipleChoiceTextClicked(MultipleChoiceText) {
    let MultipleChoice = document.getElementById(MultipleChoiceText.name);
    if (MultipleChoice.checked == false) {
        MultipleChoice.checked = true;
    }
    else if (MultipleChoice.type == "checkbox") {
        MultipleChoice.checked = false;
    }
    await MultipleChoiceClicked(MultipleChoice);
}




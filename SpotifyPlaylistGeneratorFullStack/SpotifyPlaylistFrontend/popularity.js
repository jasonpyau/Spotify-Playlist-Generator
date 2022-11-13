const popularityText = [
    "Any (Default)",
    "Higher",
    "Lower"
]

const popularityCode = [
    "Any",
    "Higher",
    "Lower"
]

import { MultipleChoice } from "./MultipleChoice.js";

let PopularityContainer = document.getElementById("PopularityContainer");

for (var i = 0; i < popularityText.length && i < popularityCode.length; i++) {
    MultipleChoice(popularityText[i], popularityCode[i], PopularityContainer, "radio", "Popularity")
}

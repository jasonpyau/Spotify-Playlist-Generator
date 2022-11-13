import { heightChanged } from "./form.js";
import { MultipleChoiceClicked } from "./MultipleChoice.js";

const REMOVE = 0;
const ADD = 1;

export var formData = {
    ArtistsInput: {
        data: [],
        allowed: 5
    },
    TracksInput: {
        data: [],
        allowed: 5
    },
    GenresInput: {
        data: [],
        allowed: 5
    },
    CountriesInput: {
        data: [],
        allowed: 1
    },
    PopularityInput: {
        data: [],
        allowed: 1
    },
    NumberInput: {
        data: [],
        allowed: 1
    }
}

export var formDataSeeds = {
    seed_artists: {
        items: 0,
        names: [],
        spotifyURLs: [],
        imageURLs: [],
        ids: []
    },
    seed_tracks: {
        items: 0,
        names: [],
        spotifyURLs: [],
        imageURLs: [],
        ids: []
    },
    seed_genres: {
        items: 0,
        ids: []
    }
}

export function getForms() {
    const defaultFormData = formData;
    const defaultFormDataSeeds = formDataSeeds;
    try {
        const tempFormData = JSON.parse(localStorage.formData);
        const tempFormDataSeeds = JSON.parse(localStorage.formDataSeeds);
        const GenresInput = tempFormData.GenresInput;
        for (let i = 0; i < tempFormDataSeeds.seed_genres.items; i++) {
            const MultipleChoice = document.getElementById(GenresInput.data[i]);
            MultipleChoice.checked = true;
            MultipleChoiceClicked(MultipleChoice);
        }
        const CountriesInput = tempFormData.CountriesInput;
        if (CountriesInput.allowed != 1) {
            const MultipleChoice = document.getElementById(CountriesInput.data[0]);
            MultipleChoiceClicked(MultipleChoice);
            MultipleChoice.checked = true;
        }
        const PopularityInput = tempFormData.PopularityInput;
        if (PopularityInput.allowed != 1) {
            const MultipleChoice = document.getElementById(PopularityInput.data[0]);
            MultipleChoiceClicked(MultipleChoice);
            MultipleChoice.checked = true;
        }
        document.getElementById("NumberInput").value = tempFormData.NumberInput.data[0];
        NumberInputChanged();
        formData = tempFormData;
        formDataSeeds = tempFormDataSeeds;
    }
    catch (error) {
        formData = defaultFormData;
        formDataSeeds = defaultFormDataSeeds;
    }
    createSeedsDisplay();
    updateSeedsDisplay();
}

let TextInputs = document.getElementsByClassName("TextInput");
for (let i = 0; i < TextInputs.length; i++) {
    TextInputs[i].addEventListener("keyup", async function() {
        if (event.key === "Enter" || event.key === ",") {
            const success = await addFormData(this.value, this.id);
            if (success) {
                this.value = "";
            }
            else {
                this.style.backgroundColor = "#ff4d4d";
                const TextInput = this;
                setTimeout(function() {
                    TextInput.style.backgroundColor = "white";
                }, 1000);
            }
        }
    });
};

export async function addFormData(newData, type) {
    var success = false;
    if (formData[type].allowed > 0) {
        formData[type].data.push(newData);
        updateAllowed(type, ADD);
        success = await searchSeed(newData, type);
        if (success) {
            updateSeedsDisplay();
            saveForms();
        }
        else {
            try {
                const i = formData[type].data.indexOf(newData);
                formData[type].data.splice(i, 1);
            }
            catch {}
        }
        return success;
    }
    else {
        return success;
    }
}

export async function removeFormData(oldData, type, updateSeedDisplay) {
    const i = formData[type].data.indexOf(oldData);
    if (i != -1) {
        formData[type].data.splice(i, 1);
        updateAllowed(type, REMOVE);
        removeSeed(i, type);
        if (updateSeedDisplay) {
            updateSeedsDisplay();
        }
        saveForms();
    }
    else if (type == "NumberInput") {
        formData[type].data.splice(0, 1);  
        updateAllowed(type, REMOVE);
        saveForms();
    }
}

function saveForms() {
    localStorage.setItem("formData", JSON.stringify(formData));
    localStorage.setItem("formDataSeeds", JSON.stringify(formDataSeeds));
}

function updateAllowed(type, method) {
    const update = (method == ADD) ? -1 : 1;
    if (type == "ArtistsInput" || type == "TracksInput" || type == "GenresInput") {
        formData.ArtistsInput.allowed += update;
        formData.TracksInput.allowed += update;
        formData.GenresInput.allowed += update;
    }
    else {
        formData[type].allowed += update;
    }
}

export function NumberInputChanged() {
    let NumberInput = document.getElementById("NumberInput");
    let PopularityText = document.getElementById("PopularityText");
    PopularityText.textContent = "Number of Songs: " + NumberInput.value;
    removeFormData(0, "NumberInput", false);
    addFormData(NumberInput.value, "NumberInput");
}

async function searchSeed(newData, type) {
    if (type == "GenresInput") {
        const seed_genres = formDataSeeds.seed_genres;
        seed_genres.items += 1;
        seed_genres.ids.push(newData);
        return true;
    }
    else if (type == "ArtistsInput" || type == "TracksInput") {
        const headers = {
            Authorization: "Bearer " + localStorage.access_token
        }
        const body = {
            q: newData,
            type: (type == "ArtistsInput") ? "artist" : "track",
            limit: 1
        }
        const returnPromise = await apiCall("/search", "GET", headers, body);
        if (returnPromise == undefined) {
            return false;
        }
        else {
            try {
                const seedUpdate = (type == "ArtistsInput") ? formDataSeeds.seed_artists : formDataSeeds.seed_tracks;
                const item = (type == "ArtistsInput") ? returnPromise.artists.items[0] : returnPromise.tracks.items[0];
                seedUpdate.items += 1;
                seedUpdate.names.push(item.name);
                seedUpdate.spotifyURLs.push(item.external_urls.spotify);
                if (type == "ArtistsInput") {
                    seedUpdate.imageURLs.push(item.images[0].url);
                }
                else {
                    seedUpdate.imageURLs.push(item.album.images[0].url);
                }
                seedUpdate.ids.push(item.id);
                return true;
            }
            catch (error) {
                return false;
            }
        }
    }
    else {
        return true;
    }
}

function removeSeed(index, type) {
    if (type == "GenresInput") {
        const seed_genres = formDataSeeds.seed_genres;
        seed_genres.items += -1;
        seed_genres.ids.splice(index, 1);
    }
    else if (type == "ArtistsInput" || type == "TracksInput") {
        const seed_type = (type == "ArtistsInput") ? formDataSeeds.seed_artists : formDataSeeds.seed_tracks;
        seed_type.items += -1;
        seed_type.names.splice(index, 1);
        seed_type.spotifyURLs.splice(index, 1);
        seed_type.imageURLs.splice(index, 1);
        seed_type.ids.splice(index, 1);
    }
}

export function createSeedsDisplay() {
    let SeedRemoveTemplate = document.getElementById("SeedRemoveHolder");
    for (let i = 1; i <= 5; i++) {
        let SeedRemove = SeedRemoveTemplate.cloneNode(true);
        SeedRemove.id = "SeedRemove"+i;
        SeedRemove.style.display = "none";
        document.getElementById("SeedDisplayHolder").appendChild(SeedRemove);
        heightChanged();
    }
  }

export function updateSeedsDisplay(input) {
    if (input != undefined) {
        formDataSeeds = input;
    }
    for (let i = 1; i <= 5; i++) {
        let SeedRemove = document.getElementById("SeedRemove"+i);
        SeedRemove.style.display = "none";
    }
    let seedIndex = 1;
    let seed_artists = formDataSeeds.seed_artists;
    let seed_tracks = formDataSeeds.seed_tracks;
    updateArtistsOrTracks(seed_artists, "seed_artists");
    updateArtistsOrTracks(seed_tracks, "seed_tracks");

    let seed_genres = formDataSeeds.seed_genres;
    for (let i = 0; i < seed_genres.items; i++, seedIndex++) {
        let SeedRemove = document.getElementById("SeedRemove"+seedIndex);
        SeedRemove.querySelector('#SeedRemoveNum').textContent = seedIndex+".";
        SeedRemove.querySelector('#SeedRemoveText').textContent = seed_genres.ids[i];
        SeedRemove.querySelector('#SeedRemoveImage').src = "https://i.scdn.co/image/ab6775700000ee8555c25988a6ac314394d3fbf5";
        SeedRemove.querySelector('#SeedRemoveImageLink').removeAttribute("href");
        SeedRemove.name = "seed_genres";
        SeedRemove.style.display = "flex";
        SeedRemove.style.justifyContent = "center";
        SeedRemove.style.alignItems = "center";
        SeedRemove.style.width = "calc(100% - 20px)";
    }

    let NoSeedDisplay = document.getElementById("NoSeedDisplay");
    if (seedIndex == 1) {
        if (NoSeedDisplay == null || NoSeedDisplay == undefined) {
            let NoSeedDisplay = document.createElement("div");
            let SeedDisplayHolder = document.getElementById("SeedDisplayHolder");
            NoSeedDisplay.id = "NoSeedDisplay";
            NoSeedDisplay.textContent = "None";
            NoSeedDisplay.style.fontSize = "18px";
            SeedDisplayHolder.appendChild(NoSeedDisplay);
        }
    }
    else {
        try {
            NoSeedDisplay.remove();
        }
        catch (error) {}
    }
    function updateArtistsOrTracks(type, name) {
        for (let i = 0; i < type.items; i++, seedIndex++) {
            let SeedRemove = document.getElementById("SeedRemove"+seedIndex);
            SeedRemove.name = name;
            SeedRemove.querySelector('#SeedRemoveNum').textContent = seedIndex+".";
            SeedRemove.querySelector('#SeedRemoveImage').src = type.imageURLs[i];
            SeedRemove.querySelector('#SeedRemoveImageLink').href = type.spotifyURLs[i];
            SeedRemove.querySelector('#SeedRemoveText').textContent = type.names[i];
            SeedRemove.style.display = "flex";
            SeedRemove.style.justifyContent = "center";
            SeedRemove.style.alignItems = "center";
            SeedRemove.style.width = "calc(100% - 20px)";
        }
    }
}

export function RemoveButtonClicked() {
    for (var i = 1, seedRemoveIndex = 1; seedRemoveIndex <= 5; seedRemoveIndex++) {
        const SeedRemove = document.getElementById("SeedRemove"+seedRemoveIndex);
        const SeedRemoveCheck = SeedRemove.querySelector('#SeedRemoveCheck');
        if (SeedRemoveCheck.checked) {
            let type = SeedRemove.name;
            if (type == "seed_artists") {
                let formIndex = i - 1;
                const oldData = formData.ArtistsInput.data[formIndex];
                removeArtistsOrTracks(oldData, "ArtistsInput");
            }
            else if (type == "seed_tracks") {
                let formIndex = i - formDataSeeds.seed_artists.items - 1;
                const oldData = formData.TracksInput.data[formIndex];
                removeArtistsOrTracks(oldData, "TracksInput");
            }
            else if (type == "seed_genres") {
                let formIndex = i - formDataSeeds.seed_artists.items - formDataSeeds.seed_tracks.items - 1;
                const id = formDataSeeds.seed_genres.ids[formIndex];
                const MultipleChoice = document.getElementById(id);
                MultipleChoice.checked = false;
                SeedRemoveCheck.checked = false;
                MultipleChoiceClicked(MultipleChoice);
            }
            SeedRemoveCheck.checked = false;
        }
        else {
            i++;
        }

        function removeArtistsOrTracks(oldData, type) {
            removeFormData(oldData, type, false);
        }
    }
    updateSeedsDisplay();
}

export async function SubmitFormButtonClicked() {
    const headers = {
        Authorization: "Bearer " + localStorage.access_token
    };
    let body = {}; 
    const seed_artists = createSeedString(formDataSeeds.seed_artists);
    if (seed_artists != undefined) {
        body.seed_artists = seed_artists;
    }
    const seed_tracks = createSeedString(formDataSeeds.seed_tracks);
    if (seed_tracks != undefined) {
        body.seed_tracks = seed_tracks;
    }
    const seed_genres = createSeedString(formDataSeeds.seed_genres);
    if (seed_genres != undefined) {
        body.seed_genres = seed_genres;
    }    
    const CountriesInput = formData.CountriesInput;
    if (CountriesInput.allowed == 0) {
        const CountriesInputData = CountriesInput.data[0];
        var market;
        if (CountriesInputData != "All") {
            market = CountriesInputData;
            body.market = market;
        }
    }
    const PopularityInput = formData.PopularityInput;
    if (PopularityInput.allowed == 0) {
        const PopularityInputData = PopularityInput.data[0];
        var min_popularity;
        var max_popularity;
        if (PopularityInputData == "Higher") {
            min_popularity = 65;
            max_popularity = 100;
        }
        else if (PopularityInputData == "Lower") {
            min_popularity = 0;
            max_popularity = 65;
        }
        else {
            min_popularity = 0;
            max_popularity = 100;
        }
        body.min_popularity = min_popularity;
        body.max_popularity = max_popularity;
    }
    if (formData.NumberInput.data.length != 0) {
        const limit = formData.NumberInput.data[0];
        body.limit = limit;
    }
    const returnPromise = await apiCall("/recommendations", "GET", headers, body);
    if (returnPromise == undefined) {
        const SubmitFormButton =  document.getElementById("SubmitFormButton");
        SubmitFormButton.style.backgroundColor = "#ff4d4d";
        setTimeout(function() {
            SubmitFormButton.style.backgroundColor = "#1db954";
        }, 1000);
    }
    else {
        localStorage.recommended = JSON.stringify(returnPromise);
        window.location.href = "recommended"
    }

    function createSeedString(seed_type) {
        const items = seed_type.items;
        const ids = seed_type.ids;
        let s = "";
        for (let i = 0; i < items; i++) {
            s += ids[0];
            if (i != items-1) {
                s += ",";
            }
        }
        return s;
    }
}

export async function apiCall(endpoint, method, headers, body) {
    const apiLink = "https://api.spotify.com/v1";
    var returnPromise;
    await $.ajax({
      url: apiLink+endpoint,
      method: method,
      contentType: "application/json",
      headers: headers,
      data: body,
      success: function(response) {
        returnPromise = response;
      },
      error: async function(error) {
        console.log(error);
      }
    }).catch(error => {});
    return returnPromise;
};

  
  

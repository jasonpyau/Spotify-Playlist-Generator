import { createSeedsDisplay } from "./formData.js";
import { updateSeedsDisplay } from "./formData.js";
import { apiCall } from "./formData.js";

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

    loadRecommended();
    await loadPlaylists();

}

function loadRecommended() {
    const tracks = JSON.parse(localStorage.recommended).tracks;
    const DefaultRecommendedRow = document.getElementById("Recommended");
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const RecommendedRow = DefaultRecommendedRow.cloneNode(true);
        RecommendedRow.id = "Recommended"+(i+1);
        RecommendedRow.name = track.uri;
        RecommendedRow.querySelector("#Num").textContent = (i+1) +".";
        RecommendedRow.querySelector("#Link").href = track.external_urls.spotify;
        RecommendedRow.querySelector("#Image").src = track.album.images[0].url;
        const ArtistName = track.artists[0].name;
        const TrackName = track.name;
        RecommendedRow.querySelector("#Song").textContent = ArtistName + " - " + TrackName;
        const preview_url = track.preview_url;
        if (preview_url == null) {
            RecommendedRow.querySelector("#Audio").style.display = "none";
            RecommendedRow.querySelector("#NoPreview").style.display = "flex";
        }
        else {
            RecommendedRow.querySelector("#Audio").src = track.preview_url;
        }
        RecommendedRow.style.display = "flex";
        document.getElementById("RecommendedContainer").appendChild(RecommendedRow);
        localStorage.recommendedItems = JSON.stringify({recommended: tracks.length, playlists: 0})
    }
}

async function loadPlaylists() {
    const headers = {
        Authorization: "Bearer " + localStorage.access_token
    }
    const body = {
        limit: 50,
        offset: 0
    }
    const returnPromise = await apiCall("/me/playlists", "GET", headers, body);
    let numPlaylists = 0;
    if (returnPromise != undefined) {
        const playlists = returnPromise.items;
        const DefaultPlaylistRow = document.getElementById("Playlist");
        for (let i = 0; i < playlists.length; i++) {
            const playlist = playlists[i];
            if (playlist.owner.id == localStorage.userid || playlist.collaborative) {
                const PlaylistRow = DefaultPlaylistRow.cloneNode(true);
                PlaylistRow.id = "Playlist"+(numPlaylists+1);
                PlaylistRow.name = playlist.id;
                PlaylistRow.querySelector("#Radio").onclick = function() {
                    checkClick();
                }
                PlaylistRow.querySelector("#Num").textContent = (numPlaylists+1) +".";
                PlaylistRow.querySelector("#Link").href = playlist.external_urls.spotify;
                const image = playlist.images[0];
                if (image == undefined) {
                    PlaylistRow.querySelector("#Image").src = "https://i.scdn.co/image/ab6775700000ee8555c25988a6ac314394d3fbf5";
                }
                else {
                    PlaylistRow.querySelector("#Image").src = image.url;
                }
                PlaylistRow.querySelector("#PlaylistName").textContent = playlist.name;
                PlaylistRow.style.display = "flex";
                document.getElementById("PlaylistsContainer").appendChild(PlaylistRow);
                numPlaylists++;
            }
        }
        let recommendedItems = JSON.parse(localStorage.recommendedItems);
        recommendedItems.playlists = numPlaylists;
        localStorage.recommendedItems = JSON.stringify(recommendedItems);
        if (numPlaylists == 0) {
            document.getElementById("NoPlaylist").style.display = "flex";
        }
    }
}

document.getElementById("NewPlaylistRadio").onclick = function() {
    checkClick();
}

function checkClick() {
    const NewPlaylistRadio = document.getElementById("NewPlaylistRadio");
    const NewPlaylistName = document.getElementById("NewPlaylistName");
    if (NewPlaylistRadio.checked) {
        NewPlaylistName.style.opacity = 1;
        NewPlaylistName.readOnly = false;
    }
    else {
        NewPlaylistName.style.opacity = .4;
        NewPlaylistName.readOnly = true;
    }
}

document.getElementById("SubmitRecButton").onclick = async function() {
    let uris = [];
    let items = JSON.parse(localStorage.recommendedItems).recommended;

    for (let i = 0; i < items; i++) {
        const RecommendedRow = document.getElementById("Recommended"+(i+1));
        const checked = RecommendedRow.querySelector("#Check").checked;
        if (checked) {
            uris.push(RecommendedRow.name);
        }
    }
    if (uris.length == 0) {
        SubmitError();
        return;
    }
    let recommendedItems = JSON.parse(localStorage.recommendedItems);
    recommendedItems.recommended = uris.length;
    localStorage.recommendedItems = JSON.stringify(recommendedItems);

    const NewPlaylistRadio = document.getElementById("NewPlaylistRadio");
    if (NewPlaylistRadio.checked) {
        let returnPromise = await createNewPlaylist();
        if (returnPromise == undefined) {
            SubmitError();
            return;
        }
        const playlist_id = returnPromise.id;
        localStorage.playlist = returnPromise.external_urls.spotify;
        returnPromise = await appendPlaylist(playlist_id, uris);
        if (returnPromise == undefined) {
            SubmitError();
        }
    }
    else {
        items = JSON.parse(localStorage.recommendedItems).playlists;
        var wasChecked;
        for (let i = 0; i < items; i++) {
            const PlaylistRow = document.getElementById("Playlist"+(i+1));
            const checked = PlaylistRow.querySelector("#Radio").checked;
            if (checked) {
                wasChecked = true;
                const playlist_id = PlaylistRow.name;
                localStorage.playlist = PlaylistRow.querySelector("#Link").href;
                returnPromise = await appendPlaylist(playlist_id, uris);
                if (returnPromise == undefined) {
                    SubmitError();
                }
            }
        }
        if (!wasChecked) {
            SubmitError();
        }
    }

    function SubmitError() {
        const SubmitRecButton =  document.getElementById("SubmitRecButton");
        SubmitRecButton.style.backgroundColor = "#ff4d4d";
        setTimeout(function() {
            SubmitRecButton.style.backgroundColor = "#1db954";
        }, 1000);
    }
    
}

async function createNewPlaylist() {
    let NewPlaylistName = document.getElementById("NewPlaylistName").value;
    if (NewPlaylistName == undefined || NewPlaylistName.length == 0) {
        NewPlaylistName = "Generated Playlist";
    }

    const headers = {
        Authorization: "Bearer " + localStorage.access_token,
        "Content-Type": "application/json"
    }
    const body = {
        name: NewPlaylistName,
        public: "true",
        collaborative: "false",
        description: "Github: @jasonpyau"
    }
    const user_id = localStorage.userid;
    const returnPromise = await apiCall("/users/"+user_id+"/playlists", "POST", headers, JSON.stringify(body));
    return returnPromise;
}

async function appendPlaylist(playlist_id, uris) {
    const headers = {
        Authorization: "Bearer " + localStorage.access_token,
        "Content-Type": "application/json"
    }
    const body = {
        uris: uris,
    }
    const returnPromise = await apiCall("/playlists/"+playlist_id+"/tracks", "POST", headers, JSON.stringify(body));
    if (returnPromise != undefined) {
        window.location.href = "playlist";
    }
    else {
        return;
    }
}
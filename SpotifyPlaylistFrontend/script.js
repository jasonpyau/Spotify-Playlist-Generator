var proxyAPI = "https://spotify-playlist-generator-api.onrender.com";
var redirectURI = "https://spotify-playlist-generator.onrender.com";
var apiLink = "https://api.spotify.com/v1";
let loginStatus = document.getElementById("LoginStatus");
let displayNameLink = document.getElementById("DisplayNameLink");
let profilePictureLink = document.getElementById("ProfilePictureLink");
let profilePicture = document.getElementById("LoginProfilePicture");
let loginButton = document.getElementById("LoginButton");
let logOutButton = document.getElementById("LogOutButton");
var code_challenge = "";
var code_verifier = "";
var access_token;
var refresh_token;
var DisplayName;
var SpotifyUserLink;
var SpotifyUserProfilePicture;

var devMode;
var devID;
var devSecret;
isDevMode();


loginButton.onclick = function() {
  reqUserAuth();
}

logOutButton.onclick = function() {
  logOut();
  window.location.href = redirectURI;
}

var authCode = window.location.search;
onLoad();

async function onLoad() {
  if (authCode.length > 0) {
    authCode = new URLSearchParams(authCode).get('code');
    await newLogin();
    window.location.href = redirectURI;
  } 
  else {
    await newCodeChallenge();
    access_token = localStorage.getItem("access_token");
    if (access_token == "null" || access_token == "undefined" || access_token == undefined) {
      logOut();
    }
    else {
      await getDisplayName();
      loginSuccess();
    }
  }
}

async function newLogin() {
  code_challenge = localStorage.getItem("code_challenge");
  code_verifier = localStorage.getItem("code_verifier");
  success = await reqAccessToken();
  if (success == 1) {
    loginSuccess();
  }
  else {
    logOut();
  }
}

function loginSuccess() {
  loginStatus.textContent = "Login Status: Logged In";
  displayNameLink.textContent = DisplayName;
  displayNameLink.href = SpotifyUserLink;
  profilePictureLink.href = SpotifyUserLink;

  if (SpotifyUserProfilePicture != undefined) {
    profilePicture.setAttribute("src", SpotifyUserProfilePicture);
  }
  

}

async function logOut() {
  loginStatus.textContent = "Login Status: Logged Out";
  displayNameLink.textContent = "Guest";
  displayNameLink.removeAttribute("href");
  profilePictureLink.removeAttribute("href");
  localStorage.setItem("access_token", "null");
  localStorage.setItem("refresh_token", "null");
}

async function newCodeChallenge() {
  var codeChallenge = "";
  const max = Math.floor(Math.random()*86)+43;
  for(var i = 0; i < max; i++) {
    var uppercase;
    if (Math.floor(Math.random()*2) == 0) {
      uppercase = 97;
    }
    else {
      uppercase = 65;
    }
    codeChallenge += String.fromCharCode(Math.floor(Math.random()*26)+uppercase);
  }
  let codeVerifier = codeChallenge;
  async function sha256(codeChallenge) {
    const msgUint8  = new TextEncoder().encode(codeChallenge);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = new Uint8Array(hashBuffer)
    let str = "";
    for (let i = 0; i < hashArray.length; i++) {
      str += String.fromCharCode(hashArray[i]);
    }
    return str;
  }
  codeChallenge = await sha256(codeChallenge);
  codeChallenge = btoa(codeChallenge).toString()
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  localStorage.setItem("code_challenge", codeChallenge);
  localStorage.setItem("code_verifier", codeVerifier);
  code_verifier = codeVerifier;
  code_challenge = codeChallenge;
  return;
}

async function reqUserAuth() {
  window.location.href = proxyAPI+"/login?code_challenge="+code_challenge+"&devmode="+devMode+"&client_id="+devID;
}

async function reqAccessToken() {
  success = 0;
  const body = {
    authorization_code: authCode,
    code_verifier: code_verifier,
    devmode: devMode,
    client_id: devID,
    client_secret: devSecret
  }
  await $.ajax({
    url: proxyAPI+"/req_access_token",
    method: "GET",
    contentType: "application/x-www-form-urlencoded",
    data: body,
    success: function(response) {
      access_token = response.access_token;
      refresh_token = response.refresh_token;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      success = 1;
    },
    error: function(error) {
      access_token = "null";
      refresh_token = "null";
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      console.log(error);
      success = 0;
    }
  }).catch(error => {});
  return success;
}

async function reqRefreshToken() {
  success = 0;
  refresh_token = localStorage.getItem("refresh_token");
  const body = {
    refresh_token: refresh_token,
    devmode: devMode,
    client_id: devID,
    client_secret: devSecret
  }
  await $.ajax({
    url: proxyAPI+"/refresh_access_token",
    method: "GET",
    contentType: "application/x-www-form-urlencoded",
    data: body,
    success: function(response) {
      console.log("Refresh success!")
      access_token = response.access_token;
      refresh_token = response.refresh_token;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      success = 1;
    },
    error: function(error) {
      access_token = "null";
      refresh_token = "null";
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", access_token);
      console.log(error);
      success = 0;
      logOut();
    }
  }).catch(error => {});
  return success;
}

async function apiCall(endpoint, method, headers, body) {
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

async function getDisplayName() {
  await reqRefreshToken();
  const apiUrl = "/me"
  const headers = {
    Authorization: "Bearer " + access_token,
  }
  const body = null;
  var returnPromise = await apiCall(apiUrl, "GET", headers, body);
  if (returnPromise == undefined) {
    return;
  }
  DisplayName = returnPromise.display_name;
  SpotifyUserLink = returnPromise.external_urls.spotify;
  localStorage.userid = returnPromise.id;
  try {
    SpotifyUserProfilePicture = returnPromise.images[0].url;
  } catch (error) {}
  return;
}




function isDevMode() {
  var devModeData;
  try {
    devModeData = JSON.parse(localStorage.dev);
  }
  catch (error) {
    const devData = {
      devmode: false,
      id: "None",
      secret: "None"
    }
    localStorage.setItem("dev", JSON.stringify(devData));
    devModeData = JSON.parse(localStorage.dev);
  }
  devMode = devModeData.devmode;
  devID = devModeData.id;
  devSecret = devModeData.secret;
  const DevModeDiv = document.createElement("div");
  if (devMode == true) {
    DevModeDiv.textContent = "Dev Mode";
    DevModeDiv.style.fontSize = "28px";
    DevModeDiv.style.fontWeight = "bold";
    DevModeDiv.style.textDecoration = "underline";
    document.getElementById("Header").appendChild(DevModeDiv);
  }
}
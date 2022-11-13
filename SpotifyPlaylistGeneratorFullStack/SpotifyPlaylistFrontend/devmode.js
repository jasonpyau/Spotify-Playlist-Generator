
document.getElementById("currentMode").textContent = "Dev Mode: "+(JSON.parse(localStorage.dev).devmode);
document.getElementById("currentID").textContent = "Current Client ID: "+(JSON.parse(localStorage.dev).id);
document.getElementById("currentSecret").textContent = "Current Client Secret: "+(JSON.parse(localStorage.dev).secret);

function submit() {
    const devData = {
        devmode: true,
        id: document.getElementById("id").value,
        secret: document.getElementById("secret").value
    }
    localStorage.setItem("dev", JSON.stringify(devData));
    document.getElementById("currentMode").textContent = "Dev Mode: "+(JSON.parse(localStorage.dev).devmode);
    document.getElementById("currentID").textContent = "Current Client ID: "+(JSON.parse(localStorage.dev).id);
    document.getElementById("currentSecret").textContent = "Current Client Secret: "+(JSON.parse(localStorage.dev).secret);
    localStorage.setItem("access_token", "null");
    localStorage.setItem("refresh_token", "null");
}

function exit() {
    const devData = {
        devmode: false,
        id: "None",
        secret: "None"
    }
    localStorage.setItem("dev", JSON.stringify(devData));
    document.getElementById("currentMode").textContent = "Dev Mode: "+(JSON.parse(localStorage.dev).devmode);
    document.getElementById("currentID").textContent = "Current Client ID: "+(JSON.parse(localStorage.dev).id);
    document.getElementById("currentSecret").textContent = "Current Client Secret: "+(JSON.parse(localStorage.dev).secret);
    localStorage.setItem("access_token", "null");
    localStorage.setItem("refresh_token", "null");
}

function back() {
    window.location.href = window.location.origin;
}
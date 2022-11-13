const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const { env } = require('process');
const url = require('url');
require('dotenv').config();
const needle = require('needle');
const rateLimit = require('express-rate-limit');

const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const port = process.env.PORT || 3000;

const app = express();
const limit = rateLimit({
    windowMs: 1*60*1000,
    max: 30
});

app.use(limit);
app.set('trust proxy', 1);
app.use(cors());

app.use(express.static('user'));

app.get('/login', function (req, res) {
    try {
        const params = url.parse(req.url, true).query;
        const isDevMode = params.devmode;
        var tempClientID;
        if (isDevMode == "true") {
            tempClientID = params.client_id;
        }
        else {
            tempClientID = client_id;
        }
        const code_challenge = params.code_challenge;
        res.redirect('https://accounts.spotify.com/authorize?' +
            querystring.stringify({
                response_type: 'code',
                redirect_uri: redirect_uri,
                client_id: tempClientID,
                code_challenge_method: 'S256',
                code_challenge: code_challenge,
                scope: "playlist-modify-public playlist-modify-private playlist-read-private"}));
            res.status(200);
    }
    catch (error) {
        console.log(error);
        res.status(500);
    }
});


app.get('/req_access_token', async function (req, res) {
    try {
        const params = url.parse(req.url, true).query;
        const code_verifier = params.code_verifier;
        const authorization_code = params.authorization_code;

        const isDevMode = params.devmode;
        var tempClientID;
        var tempClientSecret;
        if (isDevMode == "true") {
            tempClientID = params.client_id;
            tempClientSecret = params.client_secret;
        }
        else {
            tempClientID = client_id;
            tempClientSecret = client_secret;
        }

        const headers = {
            Authorization: "Basic "+ Buffer.from(tempClientID+":"+tempClientSecret).toString('base64'),
            "Content-Type": "application/x-www-form-urlencoded"
        };
        const apiURL = "https://accounts.spotify.com/api/token";
        const options = {
            headers,         
            grant_type: 'authorization_code',
            code: authorization_code,
            redirect_uri: redirect_uri,
            client_id: tempClientID,
            code_verifier: code_verifier};
        await needle.post(apiURL, options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.json(body);
                res.status(200);
            }
            else {
                res.json(body);
                res.status(500);
            }
        });
    }
    catch (error) {
        console.log(error);
        res.json(error);
        res.status(500);
    }
});

app.get('/refresh_access_token', async function (req, res) {
    try {
        const params = url.parse(req.url, true).query;
        const refresh_token = params.refresh_token;

        const isDevMode = params.devmode;
        var tempClientID;
        var tempClientSecret;
        if (isDevMode == "true") {
            tempClientID = params.client_id;
            tempClientSecret = params.client_secret;
        }
        else {
            tempClientID = client_id;
            tempClientSecret = client_secret;
        }

        const headers = {
            Authorization: "Basic "+ Buffer.from(tempClientID+":"+tempClientSecret).toString('base64'),
            "Content-Type": "application/x-www-form-urlencoded"
        };
        const apiURL = "https://accounts.spotify.com/api/token";
        const options = {
            headers,         
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: tempClientID};
        await needle.post(apiURL, options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.json(body);
                res.status(200);
            }
            else {
                res.json(body);
                res.status(500);
            }
        });
    }
    catch (error) {
        console.log(error);
        res.json(error);
        res.status(500);
    }
});

app.listen(port, () => console.log(`Running on port ${port}`));


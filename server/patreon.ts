import express = require("express");
import request = require("request");
import patreon = require('patreon');
const patreonAPI = patreon.default;
const patreonOAuth = patreon.oauth;

interface PatreonPostAttributes {
    title: string;
    content: string;
    url: string;
    created_at: string;
    was_posted_by_campaign_owner: boolean;
}

interface PatreonPost {
    attributes: PatreonPostAttributes;
    id: string;
    type: string;
}

export const configureLogin = (app: express.Express) => {
    if (!process.env.PATREON_CLIENT_ID) {
        return;
    }

    const redirectPath = "/r/patreon";
    const redirectUri = process.env.BASE_URL + redirectPath;

    app.get("/r/patreon", (req, res) => {
        const code = req.body.code,
            state = req.body.state;

        const opts = {
            code,
            grant_type: "authorization_code",
            client_id: process.env.PATREON_CLIENT_ID,
            client_secret: process.env.PATREON_CLIENT_SECRET,
            redirect_uri: redirectUri
        };

        request.post("api.patreon.com/oauth2/token", opts, (error, response, body) => {
            const accessToken = body.access_token,
                refreshToken = body.refresh_token;

        });
    });
}

export const getNews = (app: express.Express) => {
    if (!process.env.PATREON_URL) {
        return;
    }

    request.get(process.env.PATREON_URL,
        (error, response, body) => {
            const json: { data: PatreonPost[] } = JSON.parse(body);
            if (json.data) {
                const latestPost = json.data.filter(d => d.attributes.was_posted_by_campaign_owner)[0];
                app.get("/whatsnew/", (req, res) => {
                    res.json(latestPost);
                });
            }
        });
}


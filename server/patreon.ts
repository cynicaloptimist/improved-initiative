import express = require("express");
import request = require("request");
import patreon = require("patreon");
import * as DB from "./dbconnection";

const OAuthClient = patreon.oauth(process.env.PATREON_CLIENT_ID, process.env.PATREON_CLIENT_SECRET);
const storageRewardIds = ["1322253", "1937132"];

interface Post {
    attributes: {
        title: string;
        content: string;
        url: string;
        created_at: string;
        was_posted_by_campaign_owner: boolean;
    };
    id: string;
    type: string;
}

interface Pledge {
    id: string;
    type: "pledge";
    relationships: {
        reward: { data: { id: string; } }
    }
}

interface ApiResponse {
    data: {
        id: string;
    };
    included: (Pledge | {
        id: string;
        type: string;
    })[];
}

export const configureLogin = (app: express.Application) => {
    const redirectPath = "/r/patreon";
    const redirectUri = process.env.BASE_URL + redirectPath;

    app.get(redirectPath, (req, res: express.Response) => {
        console.log("Got redirect");
        const code = req.query.code,
            state = req.query.state;

        OAuthClient.getTokens(code, redirectUri, (tokensError, tokens) => {
            if (tokensError) {
                console.error(tokensError);
                res.end(tokensError);
                return;
            }

            const APIClient = patreon.default(tokens.access_token);
            APIClient(`/current_user`, function (currentUserError, apiResponse: ApiResponse) {
                if (currentUserError) {
                    console.error(currentUserError);
                    res.end(currentUserError);
                    return;
                }

                const userRewards = apiResponse.included.filter(i => i.type === "pledge").map((r: Pledge) => r.relationships.reward.data.id);
                const hasStorage = userRewards.some(id => storageRewardIds.indexOf(id) !== -1);
                const standing = hasStorage ? "pledge" : "none";

                DB.upsertUser(apiResponse.data.id, tokens.access_token, tokens.refresh_token, standing, res);
            });
        });
    });
}

export const getNews = (app: express.Application) => {
    if (!process.env.PATREON_URL) {
        return;
    }

    request.get(process.env.PATREON_URL,
        (error, response, body) => {
            const json: { data: Post[] } = JSON.parse(body);
            if (json.data) {
                const latestPost = json.data.filter(d => d.attributes.was_posted_by_campaign_owner)[0];
                app.get("/whatsnew/", (req, res) => {
                    res.json(latestPost);
                });
            }
        });
}


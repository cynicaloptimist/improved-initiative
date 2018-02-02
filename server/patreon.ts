import express = require("express");
import * as _ from "lodash";
import patreon = require("patreon");
import request = require("request");
import * as DB from "./dbconnection";

import { User } from "./user";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

const storageRewardIds = ["1322253", "1937132"];
const epicRewardIds = ["1937132"];

const baseUrl = process.env.BASE_URL,
    patreonClientId = process.env.PATREON_CLIENT_ID,
    patreonClientSecret = process.env.PATREON_CLIENT_SECRET,
    patreonUrl = process.env.PATREON_URL;

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
    };
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

interface TokensResponse {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    scope: string;
    token_type: string;
}

function handleCurrentUser(req: Req, res: Res, tokens: TokensResponse) {
    return (currentUserError, apiResponse: ApiResponse) => {
        if (currentUserError) {
            console.error(currentUserError);
            res.end(currentUserError);
            return;
        }

        const encounterId = req.query.state.replace(/['"]/g,"");
        const relationships = apiResponse.included || [];

        const userRewards = relationships.filter(i => i.type === "pledge").map((r: Pledge) => {
            if (r.relationships && r.relationships.reward && r.relationships.reward.data) {
                return r.relationships.reward.data.id;
            } else {
                return "none";
            }
        });

        const hasStorage = _.intersection(userRewards, storageRewardIds).length > 0;
        const hasEpicInitiative = _.intersection(userRewards, epicRewardIds).length > 0;
        const standing = hasStorage ? "pledge" : "none";

        req.session.hasStorage = hasStorage;
        req.session.hasEpicInitiative = hasEpicInitiative;
        req.session.isLoggedIn = true;

        DB.upsertUser(apiResponse.data.id, tokens.access_token, tokens.refresh_token, standing)
            .then(user => {
                req.session.userId = user._id;
                res.redirect(`/e/${encounterId}`);
            }).catch(err => {
                console.error(err);
            });
    };
}

export function configureLoginRedirect(app: express.Application) {
    const redirectPath = "/r/patreon";
    const redirectUri = baseUrl + redirectPath;

    app.get(redirectPath, (req: Req, res: Res) => {
        try {
            const code = req.query.code;
            
            const OAuthClient = patreon.oauth(patreonClientId, patreonClientSecret);
    
            OAuthClient.getTokens(code, redirectUri, (tokensError, tokens: TokensResponse) => {
                if (tokensError) {
                    console.error(tokensError);
                    res.end(tokensError);
                    return;
                }
    
                const APIClient = patreon.default(tokens.access_token);
                APIClient(`/current_user`, handleCurrentUser(req, res, tokens));
            });
        } catch (e) {
            res.status(500).send(e);
        }
    });
}

export function configureLogout(app: express.Application) {
    const logoutPath = "/logout";
    app.get(logoutPath, (req: Req, res: Res) => {
        req.session.destroy(err => {
            if (err) {
                console.error(err);
            }
            return res.redirect(baseUrl);
        });
    });
}

function updateLatestPost(latestPost: { post: Post }) {
    return request.get(patreonUrl,
        (error, response, body) => {
            const json: { data: Post[] } = JSON.parse(body);
            if (json.data) {
                latestPost.post = json.data.filter(d => d.attributes.was_posted_by_campaign_owner)[0];
            }
        });
}

export function startNewsUpdates(app: express.Application) {
    const latest: { post: Post } = { post: null };
    if (!patreonUrl) {
        return;
    }

    updateLatestPost(latest);

    app.get("/updatenews/", (req: Req, res: Res) => {
        updateLatestPost(latest);
        res.sendStatus(200);
    });

    app.get("/whatsnew/", (req, res) => {
        res.json(latest.post);
    });
}


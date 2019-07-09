import express = require("express");
import * as _ from "lodash";
import patreon = require("patreon");
import request = require("request");

import * as DB from "./dbconnection";

import thanks from "../thanks";

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
    reward: { data: { id: string } };
  };
}

interface ApiResponse {
  data: {
    id: string;
  };
  included: (
    | Pledge
    | {
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

export function configureLoginRedirect(app: express.Application) {
  const redirectPath = "/r/patreon";
  const redirectUri = baseUrl + redirectPath;

  app.get(redirectPath, async (req: Req, res: Res) => {
    try {
      console.log("req.query >" + JSON.stringify(req.query));
      console.log("req.body >" + JSON.stringify(req.body));
      const code = req.query.code;

      const OAuthClient = patreon.oauth(patreonClientId, patreonClientSecret);

      const tokens = await OAuthClient.getTokens(code, redirectUri);

      const APIClient = patreon.patreon(tokens.access_token);
      const { rawJson } = await APIClient(`/current_user`);
      await handleCurrentUser(req, res, tokens, rawJson);
    } catch (e) {
      console.error("Patreon login flow failed: " + e);
      res.status(500).send(e);
    }
  });
}

async function handleCurrentUser(
  req: Req,
  res: Res,
  tokens: TokensResponse,
  apiResponse: any
) {
  console.log(`api response: ${JSON.stringify(apiResponse)}`);

  const encounterId = req.query.state.replace(/['"]/g, "");
  const relationships = apiResponse.included || [];

  const userRewards = relationships
    .filter(i => i.type === "pledge")
    .map((r: Pledge) => {
      if (
        r.relationships &&
        r.relationships.reward &&
        r.relationships.reward.data
      ) {
        return r.relationships.reward.data.id;
      } else {
        return "none";
      }
    });

  const userId = apiResponse.data.id;
  const standing = getUserAccountLevel(userId, userRewards);

  const session = req.session;
  if (session === undefined) {
    throw "Session is undefined";
  }

  session.hasStorage = standing == "pledge" || standing == "epic";
  session.hasEpicInitiative = standing == "epic";
  session.isLoggedIn = true;

  const user = await DB.upsertUser(apiResponse.data.id, standing);
  if (user === undefined) {
    throw "Failed to insert user into database";
  }
  session.userId = user._id;
  res.redirect(`/e/${encounterId}`);
}

function getUserAccountLevel(userId: string, rewardIds: string[]) {
  const hasStorageReward =
    _.intersection(rewardIds, storageRewardIds).length > 0;

  const hasEpicInitiativeThanks = _.includes(
    thanks.map(t => t.PatreonId),
    userId
  );
  const hasEpicInitiativeReward =
    _.intersection(rewardIds, epicRewardIds).length > 0;

  const hasEpicInitiative = hasEpicInitiativeThanks || hasEpicInitiativeReward;

  const standing = hasEpicInitiative
    ? "epic"
    : hasStorageReward
    ? "pledge"
    : "none";

  return standing;
}

export function configureLogout(app: express.Application) {
  const logoutPath = "/logout";
  app.get(logoutPath, (req: Req, res: Res) => {
    if (req.session == null) {
      throw "Session is not available";
    }

    req.session.destroy(err => {
      if (err) {
        console.error(err);
      }

      if (baseUrl == null) {
        throw "Base URL is not configured.";
      }

      return res.redirect(baseUrl);
    });
  });
}

function updateLatestPost(latestPost: { post: Post | null }) {
  if (patreonUrl == null) {
    throw "Patreon URL is not configured.";
  }

  request.get(patreonUrl, (error, response, body) => {
    let json: { data: Post[] };
    try {
      json = JSON.parse(body);
    } catch {
      json = { data: [] };
    }
    if (json.data) {
      latestPost.post = json.data.filter(
        d => d.attributes.was_posted_by_campaign_owner
      )[0];
    }
  });
}

export function startNewsUpdates(app: express.Application) {
  const latest: { post: Post | null } = { post: null };
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

export function configurePatreonWebhookReceiver(app: express.Application) {
  app.post("/patreon_webhook/", async (req, res) => {
    if (process.env.PATREON_WEBHOOK_SECRET) {
      const signature = req.header("X-Patreon-Signature");
      //TODO: verify  https://docs.patreon.com/#webhooks
    }

    console.log(JSON.stringify(req.body));

    const userId = _.get(req.body, "data.relationships.patron.data.id", null);
    const rewardId = _.get(req.body, "data.relationships.reward.data.id", null);

    if (!userId || !rewardId) {
      return res.send(400);
    }

    const userAccountLevel = getUserAccountLevel(userId, [rewardId]);

    await DB.upsertUser(userId, userAccountLevel);

    return res.send(201);
  });
}

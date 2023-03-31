const RedisStore = require("connect-redis/dist/cjs").default;
import { RequestHandler } from "express";
import expressSession = require("express-session");
import moment = require("moment");
import redis = require("redis");

import { probablyUniqueString } from "../common/Toolbox";

export default async function(
  redisConnectionString?: string
): Promise<RequestHandler> {
  let store: any = null;

  if (redisConnectionString) {
    const sessionClient = redis.createClient({
      url: redisConnectionString,
      socket: { tls: false, rejectUnauthorized: false }
    });
    sessionClient.on("error", error => {
      console.error("Problem with Session store Redis Client: ");
      console.error(error);
    });
    store = new RedisStore({
      client: sessionClient
    });
  }

  const cookie = {
    maxAge: moment.duration(1, "weeks").asMilliseconds()
  };

  const session = expressSession({
    store: store || undefined,
    secret: process.env.SESSION_SECRET || probablyUniqueString(),
    resave: false,
    saveUninitialized: false,
    cookie
  });

  return session;
}
